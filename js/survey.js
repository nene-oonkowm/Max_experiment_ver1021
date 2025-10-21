// survey.js

const survey_intro = {
  type: jsPsychInstructions,
  pages: [
// Practice0（練習開始）
    `<div style="text-align:center; max-width:900px; margin:auto; line-height:1.0;">
      <h2>実験を開始します</h2>
      <p>これから、実験を開始します。</p>
      <p>実験では、実際に他の参加者と同時にカードを選択していただきます。</p>
      <p>カードには<b>0～1000円</b>の金額が割り当てられています</p>
      <p><b>あなたがこの実験で獲得したカードの金額は、あなたが受け取る報酬金額に反映されます。</b></p>
      <p>実験中に分からないことがあれば、Zoomウェビナーのチャット機能で実験者にお知らせください。</p>
      <p>準備ができたら、「次へ」ボタンをクリックしてください。</p>
    </div>`,
  ],
  show_clickable_nav: true,
  allow_backward: false,
  button_label_previous: '戻る',
  button_label_next: '次へ',
  onload: function() {
    resetGlobalTimeout(); // タイマー再開
  }
};

const now = new Date();
const timestamp = now.toISOString();

function createSurvey(jsPsych) {
  
  // 報酬生成
  function randn_bm() {
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }
  function generateNormalRewards(n = 10, mean = 500, sd = 200, min = 0, max = 1000) {
    let rewards = [];
    while(rewards.length < n) {
      let value = Math.round((randn_bm() * sd + mean) / 50) * 50;
      value = Math.max(min, Math.min(max, value));
      rewards.push(value);
    }
    return rewards;
  }
  var values = generateNormalRewards();
  var labels = ["A","B","C","D","E","F","G","H","I","J"]; 
  var cards = labels.map((label, i) => ({
  label: label,
  value: values[i],
  revealed: false,
  available: true
  }));
  const saveInitialCardsTrial = {
  type: jsPsychHtmlButtonResponse,
  stimulus: "<p>しばらくお待ちください。</p>",
  choices: [],
  trial_duration: 500, // 0.5秒だけ表示
  on_load: function() {
    jsPsych.data.write({
      id: window.id || "",
      round: 0,
      label: null,
      value: null,
      decision: null,
      result: null,
      random: null,
      A: cards[0].value,
      B: cards[1].value,
      C: cards[2].value,
      D: cards[3].value,
      E: cards[4].value,
      F: cards[5].value,
      G: cards[6].value,
      H: cards[7].value,
      I: cards[8].value,
      J: cards[9].value,
      rt: null,
      timestamp: new Date().toISOString(),
      category: "SurveyData"
    });
  }
};
  
  // 選択肢の価値（value）配列
  //var choiceValues = cards.map(c => c.value);
  //var available = cards.map(c => c.available); // 利用可能な選択肢  
  let roundNumber = 1; // ラウンド数管理用

  // survey1 選択肢表示
  function getChoiceTrial() {
    return {
      type: jsPsychHtmlButtonResponse,
      stimulus: function(){
        return`
          <h3>ラウンド${roundNumber}　ー選択フェーズー</h3>
          <p>選べるカードは${cards.filter(c => c.available).length}枚です。${cards.filter(c => c.available).length}枚のカードの中からめくるカードを1枚選んでください。</p>
          </div>
        `;
      },
      choices: function() {
        return cards.map((c, i) => {
          if (c.available) {
            return `<span>${c.label}</span><span style="font-size:0.8em;">${c.revealed ? `${c.value}円` : "&nbsp;"}</span>`;
          } else {
            return `<span style="color:#fff;">&nbsp;</span><span style="color:#fff;">&nbsp;</span>`;
          }
        });
      },
      on_finish: function(data){
        let remain = cards.map((c, i) => c.available ? i : null).filter(i => i !== null);
        let chosenIndex = remain[data.response];
        
        cards[chosenIndex].revealed = true;
        jsPsych.data.write({chosen: chosenIndex});

      },
      button_html: function(trial, choice) {
        // 利用不可（真っ白）なら白枠、それ以外は灰色枠
        return cards.map((c, i) => {
          if (c.available) {
            return `<button class="choice-card" style="border:2px solid #888;">%choice%</button>`;
          } else {
            return `<button class="choice-card" style="border:2px solid #fff;" disabled>%choice%</button>`;
          }
        });
      },
      on_finish: function(data){
        let chosenIndex = data.response;
        cards[chosenIndex].revealed = true;
        jsPsych.data.write({chosen: chosenIndex});
        console.log("Chosen index:", chosenIndex, "Card:", cards[chosenIndex]); // デバッグ用
        const availableLabels = cards.filter(c => c.available).map(c => c.label);
        console.log("利用可能な選択肢:", availableLabels);

        // 残っているカードの枚数をカウント
        const remainingCards = cards.filter(c => c.available).length;
        // エージェント数 = 残りカード枚数 - 1
        const agentCount = Math.max(remainingCards - 1, 0);
        // agentAlive配列を更新（trueがagentCount個、残りはfalse）
        agentAlive = Array(agentCount).fill(true);
        console.log("エージェント数を更新:", agentCount, agentAlive);
      }
    };
  }
      

  // survey2 意思決定＆エージェント競合判定
  var decisionTrial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function(){
      var last_choice = jsPsych.data.get().last(1).values()[0].chosen;
      let html = `
      <h3>ラウンド${roundNumber}　ー決定フェーズー</h3>
      <p>${cards[last_choice].label} の金額は <b>${cards[last_choice].value}円</b> です。</p>`;
      html += `<div style="display:flex;flex-direction:row;justify-content:center;align-items:flex-end;gap:12px;margin:24px 0;">`;
      for(let i=0; i<cards.length; i++){
        if (!cards[i].available ) {
          html += `
            <button class="choice-card" style="
              width:75px;height:100px;
              border:2px solid #fff;
              border-radius:12px;
              background:#fff;
              color:#fff;
              font-size:1.1em;font-weight:bold;
              display:flex;flex-direction:column;justify-content:center;align-items:center;
              box-sizing:border-box;
            " disabled>
              <span>&nbsp;</span>
              <span style="font-size:0.9em;">&nbsp;</span>
            </button>
          `;
          continue;
        }
        html += `
          <button class="choice-card" style="
            width:75px;height:100px;
            border:${i === last_choice ? '4px' : '2px'} solid ${i === last_choice ? '#e91e63' : '#888'};
            border-radius:12px;
            background:#fff;
            color:#000;
            font-size:1.1em;font-weight:bold;
            display:flex;flex-direction:column;justify-content:center;align-items:center;
            box-sizing:border-box;
            font-weight:${i === last_choice ? 'bold' : 'normal'};
          " disabled>
            <span>${cards[i].label}</span>
            <span style="font-size:0.9em;">
              ${cards[i].revealed ? `${cards[i].value}円` : ""}
            </span>
          </button>
        `;
      }
     
      html += `</div>`;
      html += `<p>このカードで決定しますか？</p>`;
      return html;
    },
    choices: ["はい", "いいえ"],
    on_finish: function(data){
      roundNumber += 1; // ラウンド数をインクリメント
      data.decision = parseInt(data.response); // 0=意思決定, 1=しない
      data.round = roundNumber;
      const last_choice_data = jsPsych.data.get().filter({trial_type: "html-button-response"}).last(2).values()[0];
      data.chosen = last_choice_data.chosen;
      // 追加でカード情報も保存したい場合
      if (typeof data.chosen !== "undefined" && cards[data.chosen]) {
        data.chosen_label = cards[data.chosen].label;
        data.chosen_value = cards[data.chosen].value;
      }
      data.phase = "decision";
      console.log("Decision:", data.decision, "Raw response:", data.response);
      console.log(jsPsych.data.get().last(1).values()[0]);  
    } 
  };

  // survey3 待機画面
  const waitTrial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function(){
      return `
        <p>他の参加者が考えています、そのままお待ちください。</p>
        <div style="display:flex;justify-content:center;align-items:center;margin-top:24px;">
          <div class="loader"></div>
        </div>
        <style>
          .loader {
            border: 8px solid #f3f3f3;
            border-top: 8px solid #72777aff;
            border-radius: 50%;
            width: 48px;
            height: 48px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
        </style>
      `;
    },
    choices: "NO_KEYS",
    trial_duration: function() {
      // 5～20秒（5000～20000ミリ秒）のランダムな値を返す
      return Math.floor(Math.random() * (20000 - 5000 + 1)) + 5000;
    }
  };

  // 競合判定・獲得判定
  // エージェント管理用（グローバルで保持）
let agentAlive = Array(9).fill(true); // 9体のエージェントが生存

function agentDecisions() {
  let agentChoices = [];
  let agentDecisionsArr = [];
  for(let agent=0; agent<9; agent++) {
    if(!agentAlive[agent]) continue; // 獲得済みエージェントはスキップ
    let indices = cards.map((C, i) => cards[i].available ? i : null).filter(i => i !== null);
    let choice = indices[Math.floor(Math.random() * indices.length)];
    agentChoices.push(choice);
    let prob = cards[choice].value /1000;
    let decision = Math.random() < prob ? 1 : 0;
    agentDecisionsArr.push({agent, choice, decision});
  }
  return agentDecisionsArr;
}

  //survey4 結果表示
  var resultTrial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function(){
      var last_decision_data = jsPsych.data.get().filter({phase: "decision"}).last(1).values();
      if (last_decision_data.length < 1 || typeof last_decision_data[0].chosen === "undefined") {
        console.error("last_decision_dataが不正です", last_decision_data);
        return "<p>選択データが不足しています。やり直してください。</p>";
      }
      var last_choice = last_decision_data[0].chosen;
      var last_decision = last_decision_data[0].decision;
    
      // 毎回エージェント意思決定
      let agents = agentDecisions();
      // 意思決定したエージェント一覧
      let agentWinners = agents.filter(c => c.decision === 1);
      console.log("Agent decisions:", agents);
      console.log("Agent winners:", agentWinners);
      // 参加者と同じカードを選び意思決定したエージェントのみをagentCompetitorとして抽出
      let agentCompetitor = agents.filter(c => c.choice === last_choice && c.decision === 1);
      console.log("Agent competitors:", agentCompetitor);

      // エージェントが獲得した場合、そのエージェントは減る
      agentWinners.forEach(c => { 
        agentAlive[c.agent] = false;
        cards[c.choice].available = false;
        console.log(`エージェント${c.agent + 1} が ${cards[c.choice].label}（${cards[c.choice].value}円）を獲得しました`); 
      });
    

      // 参加者が「いいえ」の場合
      if(last_decision === 1) {
        decision = 0; // 意思決定しない
        result = -1; // 獲得しない
        random = 0;
        return `<p>次のラウンドの選択フェーズに進みます。</p>`;
      }

      // 参加者が「はい」の場合
      let winner = "player";
      if(agentWinners.length > 0){
        // 参加者＋エージェントで抽選
        let total = agentCompetitor.length + 1;
        let rand = Math.floor(Math.random() * total); 
        winner = rand === 0 ? "player" : "agent";
      }

      if(winner === "agent"){
        decision = 1; // 意思決定
        result = 0; // 獲得失敗
        random = 0;
        return `<p>残念！このカードは他の参加者に獲得されました。<br>選択フェーズに戻ります。</p>`;
      }else{
        decision = 1; // 意思決定
        result = 1; // 獲得成功
        random = 0;
        return `<p>おめでとうございます！${cards[last_choice].label}のカード（${cards[last_choice].value}円）を獲得しました！</p>
        <p>あなたの実験報酬は <b style="color: red;">${cards[last_choice].value} 円</b>です。</p>
        <p>この後、アンケートに進みます。報酬のお支払いのためには、最後までの参加が必要です。</p>
        `;
      }
    },
    on_finish: function(data){
      var last_decision_data = jsPsych.data.get().filter({phase: "decision"}).last(1).values();
      var last_choice = last_decision_data.length > 0 ? last_decision_data[0].chosen : undefined;
      data.id = window.id; // ラウンド数はdecisionTrialでインクリメントされているため-1
      data.round = roundNumber - 1;
      data.label = cards[last_choice].label;
      data.value = cards[last_choice].value;
      data.decision = decision;
      data.result = result;
      data.random = random;
      data.A = cards[0].available ? cards[0].value : "unavailable";
      data.B = cards[1].available ? cards[1].value : "unavailable";
      data.C = cards[2].available ? cards[2].value : "unavailable";
      data.D = cards[3].available ? cards[3].value : "unavailable";
      data.E = cards[4].available ? cards[4].value : "unavailable";
      data.F = cards[5].available ? cards[5].value : "unavailable";
      data.G = cards[6].available ? cards[6].value : "unavailable";
      data.H = cards[7].available ? cards[7].value : "unavailable";
      data.I = cards[8].available ? cards[8].value : "unavailable";
      data.J = cards[9].available ? cards[9].value : "unavailable";
      data.rt = data.rt;
      data.timestamp = new Date().toISOString();
      data.category = "SurveyData";
      console.log("SurveyData saved:", jsPsych.data.get().last(1).values()[0]); // デバッグ用
    },
    choices: ["次へ"], 
    button_html: '<button class="jspsych-btn">%choice%</button>',
  };
  // ループ（参加者が獲得できるまで繰り返し）
  var choiceLoop = {
    timeline: [ 
      getChoiceTrial(), 
      decisionTrial,
      //waitTrial,   開発用
      resultTrial
    ],
    loop_function: function(data){
      const availableCards = cards.filter(c => c.available);
      var last_result = data.values().slice(-1)[0].stimulus;
      // 「おめでとうございます！」が含まれていれば終了
      // またはカードが1枚以下、またはラウンド数が11を超えたら終了
      if (
        last_result.includes("おめでとうございます！") ||
        availableCards.length <= 1 ||
        roundNumber > 11
      ) {
        return false;
      }
      return true;
    }
  };

  // 自動終了
  const autoSelectTrial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function() {
      // 残っているカードを取得
      const availableCards = cards.filter(c => c.available);
      let selectedCard;
      if (availableCards.length === 1) {
        selectedCard = availableCards[0];
      } else if (availableCards.length > 1) {
        // 2枚以上ならランダムに1枚選ぶ
        selectedCard = availableCards[Math.floor(Math.random() * availableCards.length)];
      } else {
        // 念のため
        return `<p>選択可能なカードがありません。</p>`;
      }
      // 選択済みにする
      selectedCard.revealed = true;
      selectedCard.available = false;
      // データとしても記録
      jsPsych.data.write({
        auto_selected: true,
        chosen: labels.indexOf(selectedCard.label),
        chosen_label: selectedCard.label,
        chosen_value: selectedCard.value,
        phase: "auto_select"
      });
      //分岐メッセージ
      let roundMsg = "";
        if (roundNumber > 11) {
          roundMsg = `
            <h3>ラウンド12</h3>
            <p><b>ラウンドが12ラウンドに入ったため、</b></p>`;
        } else {
          roundMsg = `<p>選択可能なカードが${availableCards.length}枚となったため、</p>`;
        }

        return `
          <h3>自動終了</h3>
          ${roundMsg}
          <p><b>${selectedCard.label}</b>のカード（${selectedCard.value}円）が自動的に選択されました。</p>
          <p>このカードがあなたの獲得カードとなります。</p>
          <p>次へ進んでください。</p>
        `;
        },
        on_finish: function(data){
          var last_decision_data = jsPsych.data.get().filter({phase: "decision"}).last(1).values();
          var last_choice = last_decision_data.length > 0 ? last_decision_data[0].chosen : undefined;
          data.id = window.id; // ラウンド数はdecisionTrialでインクリメントされているため-1
          data.round = roundNumber - 1;
          data.label = cards[last_choice].label;
          data.value = cards[last_choice].value;
          data.decision = decision;
          data.result = 1
          data.random = 1
          data.A = cards[0].available ? cards[0].value : "unavailable";
          data.B = cards[1].available ? cards[1].value : "unavailable";
          data.C = cards[2].available ? cards[2].value : "unavailable";
          data.D = cards[3].available ? cards[3].value : "unavailable";
          data.E = cards[4].available ? cards[4].value : "unavailable";
          data.F = cards[5].available ? cards[5].value : "unavailable";
          data.G = cards[6].available ? cards[6].value : "unavailable";
          data.H = cards[7].available ? cards[7].value : "unavailable";
          data.I = cards[8].available ? cards[8].value : "unavailable";
          data.J = cards[9].available ? cards[9].value : "unavailable";
          data.rt = data.rt;
          data.timestamp = new Date().toISOString();
          data.category = "SurveyData";
          console.log("SurveyData saved:", jsPsych.data.get().last(1).values()[0]); // デバッグ用
        },
        choices: ["次へ"]
    };

  // 必要なデータだけを抽出してCSV保存するtrial
  const saveFilteredCSVTrial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "<p>データを保存しています。<br>しばらくお待ちください。</p>",
    choices: [],
    trial_duration: 1000,
    on_load: function() {
      // 例：categoryが"SurveyData"のtrialだけ抽出し、必要なカラムだけ抜き出す
      const filtered = jsPsych.data.get().filter({category: "SurveyData"}).values();
      // 必要なカラムだけに整形
      const minimal = filtered.map(d => ({
        id: d.id,
        round: d.round,
        label: d.label,
        value: d.value,
        decision: d.decision,
        result: d.result,
        random: d.random,
        A: d.A,
        B: d.B,
        C: d.C,
        D: d.D,
        E: d.E,
        F: d.F,
        G: d.G,
        H: d.H,
        I: d.I,
        J: d.J,
        rt: d.rt,
        timestamp: d.timestamp
      }));

      // CSV変換
      function toCSV(arr) {
        if (arr.length === 0) return "";
        const header = Object.keys(arr[0]).join(",");
        const rows = arr.map(obj => Object.values(obj).join(","));
        return [header, ...rows].join("\n");
      }
      const raw_survey_csv = toCSV(minimal);

      // ダウンロード処理
      const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); // BOM付与（Excelでの文字化け防止）
      const survey_csv = new TextDecoder().decode(bom) + raw_survey_csv;
      uploadData(`${window.id}_SurveyData.csv`, survey_csv);
    }
  };

  // タイムラインの最後に追加
  return {
    timeline: [
      saveInitialCardsTrial,
      survey_intro,
      choiceLoop,
      {
        timeline: [autoSelectTrial],
        conditional_function: function() {
          // 直前のchoiceLoopで「おめでとうございます！」が出ていれば（カード獲得済みなら）autoSelectTrialをスキップ
          const lastResult = jsPsych.data.get().last(1).values()[0];
          const surveydata = jsPsych.data.get().filter({category: "SurveyData"}).values();
          console.log("Survey Data ALL:", surveydata); // デバッグ用
          if (lastResult && lastResult.stimulus && lastResult.stimulus.includes("おめでとうございます！")) {
            return false; // スキップ
          }
          return true; // 実行
        }
      },
      {
        type: jsPsychHtmlButtonResponse,
        stimulus: "<p>次の画面へ進みます。</p>",
        choices: ["次へ"],
        button_html: '<button class="jspsych-btn">%choice%</button>',
      },
      saveFilteredCSVTrial

    ]
  };
};



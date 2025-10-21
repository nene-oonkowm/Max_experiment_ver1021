// practice.js
// ====== practice フェーズ =====

const practice_intro = {
  type: jsPsychInstructions,
  pages: [
// Practice0（練習開始）
    `<div style="text-align:center; max-width:800px; margin:auto; line-height:1.0;">
      <h2>これから練習を開始します</h2>
      <p>練習では、実験と同じ流れを3ラウンド繰り返します。</p>
      <p>練習では、他の参加者はコンピュータが担当します。</p>
      <p>これは練習ですので、<span style="color:red;">獲得するカードの金額は報酬に反映されません。</span></p>
      <p>練習中に分からないことやトラブルがあれば、zoomのQ&A機能で実験者にお知らせください。</p>
      <p>準備ができたら、「次へ」ボタンをクリックしてください。</p>
    </div>`,
  ],
  show_clickable_nav: true,
  allow_backward: false,
  button_label_previous: '戻る',
  button_label_next: '練習を始める',
  
};

// 練習フェーズの作成
function createPractice(jsPsych) {
  if (!document.getElementById('practice-global-style')) {
    const style = document.createElement('style');
    style.id = 'practice-global-style';
    // 共通スタイルを定義（survey.jsにも影響）
    style.innerHTML = `
      body {
        padding: 0 0 40px 0 !important; margin: 0 auto !important; max-width: 10000px; background: #fff;
      }
      .jspsych-content { 
        padding: 40px 32px !important; margin: auto !important; max-width: 1000px; border-radius: 16px; background: #fff; position: relative;   /*ズレ防止*/
      }
      .card-grid {
        display: flex; flex-direction: row; justify-content: center; align-items: stretch; gap: 12px; margin: 24px 0; 
      }
      .choice-card {
        width: 75px;
        height: 100px;
        margin: 0 2px 10px 0;
        border: 2px solid #888;
        border-radius: 12px;
        background: #fff;
        font-size: 1.2em;
        font-weight: bold;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        position: relative;
      }
    `;
    document.head.appendChild(style);
  }

  // 練習用トライアルの作成
  var cards = [
  { label: "A", value: 550, revealed: false, available: true },
  { label: "B", value: 450, revealed: false, available: true },
  { label: "C", value: 350, revealed: false, available: true },
  { label: "D", value: 600, revealed: false, available: true },
  { label: "E", value: 500, revealed: false, available: true },
  { label: "F", value: 350, revealed: false, available: true },
  { label: "G", value: 650, revealed: false, available: true },
  { label: "H", value: 300, revealed: false, available: true },
  { label: "I", value: 700, revealed: false, available: true },
  { label: "J", value: 400, revealed: false, available: true }
];

  //--------ROUND 1(カード10枚、はい強制)----------------------------------------------------------------------------
  //Practice1 選択
  function getChoiceTrial1() {
    return {
      type: jsPsychHtmlButtonResponse,
      stimulus: `
        <h3>練習　ラウンド1　ー選択フェーズー</h3>
        <p>選べるカードは10枚です。10枚のカードの中からめくるカードを1枚選んでください。<br>（選んだカードの金額はあなたにしかわかりません）</p>
        <div class="card-grid"></div>
      `,
      choices: cards
        .map(c => c.available ? (c.revealed ? `${c.label}：${c.value}円` : `${c.label}`) : "")
        .filter(label => label !== null),
      on_finish: function(data){
        let remain = cards.map((c, i) => c.available ? i : null).filter(i => i !== null);
        console.log("remain:", remain);
        let chosenIndex = remain[data.response];
        cards[chosenIndex].revealed = true;
        jsPsych.data.write({chosen: chosenIndex});

      },
      button_html: '<button class="choice-card">%choice%</button>',
      on_load: function() {
        console.log(jsPsych.data.get().values());
        const btns = document.querySelectorAll('.choice-card');
        btns.forEach((btn, i) => {
          if (!cards[i].available) {
            btn.disabled = true;
            btn.style.background = "#fff";
            btn.style.border = "2px solid #fff";
            btn.style.color = "#fff";
            btn.style.cursor = "default";
          }
        });
      }
    };
  }

//　Practice2 決定１
  var decisionTrial1 = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function(){
      var last_choice = jsPsych.data.get().last(1).values()[0].chosen;
      var value = cards[last_choice];
      let html = `
        <h3>練習　ラウンド1　ー決定フェーズー</h3>
        <p>${cards[last_choice].label} の金額は <b>${value.value}円</b> です。</p>`;
      html += `<div style="display:flex;flex-direction:row;justify-content:center;align-items:flex-end;gap:12px;margin:24px 0;">`;
      for(let i=0; i<cards.length; i++){
        html += `
          <button
            class="choice-card"
            style="
              width:75px;height:100px;
              border:${i === last_choice ? '4px' : '2px'} solid ${i === last_choice ? '#e91e63' : '#888'};
              border-radius:12px;
              color:#000;
              font-size:1.1em;font-weight:bold;
              display:flex;flex-direction:column;justify-content:center;align-items:center;
              box-sizing:border-box;
            "
            disabled
          >
            <span>${cards[i].label}</span>
            <span style="font-size:0.9em;">
              ${cards[i].revealed ? `${cards[i].value}円` : ""}
            </span>
          </button>
        `;
      }
      html += `</div>`;
      html += `
        <p>このカードに決定しますか？</p>
        <p style="font-size:0.8em;">決定した場合は、他の人があなたと同じカードを選んでいるか、あなたがそのカードを獲得できるかをコンピュータが判断します。
        <br>決定しなかった場合は、次のラウンドの選択フェーズに移ります。</p>
        <p style="font-size:0.8em;">練習として、ここでは「いいえ」を選択してください</p>
      `;
      return html;
    },
    choices: ["はい", "いいえ"],
    button_html: [
      '<button class="jspsych-btn" disabled>%choice%</button>', // はいボタン無効
      '<button class="jspsych-btn">%choice%</button>'
    ],
    on_finish: function(data){
      data.decision = 1; // 強制的に「いいえ」
    }
  };  

// Practice3 結果１
  var resultTrial1 = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<p>ラウンド2の選択フェーズに進みます。</p>`,
    choices: ["次へ"]
  };


//--------ROUND 2(カード8枚、いいえ強制)-------------------------------------------------------------------------------
  function getChoiceTrial2() {

//　Practice4 選択２
    return {
      type: jsPsychHtmlButtonResponse,
      on_start: function() {
        let remain = cards.map((c, i) => c.available ? i : null).filter(i => i !== null);
        if(remain.length >= 2){
          // シャッフルして先頭2つを消失
          for(let i = remain.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * (i + 1));
            [remain[i], remain[j]] = [remain[j], remain[i]];
          }
          cards[remain[0]].available = false;
          cards[remain[1]].available = false;
          console.log("消失したカード:", cards[remain[0]].label, cards[remain[1]].label);

        }
        const trials = jsPsych.data.get().filter({chosen: true}).values();
        if (trials.length > 0) {
          const last_choice = trials[trials.length - 1].chosen;
          revealed[last_choice] = true;
        }
      },
      stimulus: function(){
        return `
          <h3>練習　ラウンド2　ー選択フェーズー</h3>
          <p>選べるカードは8枚です。8枚のカードの中からめくるカードを1枚選んでください。</p>
          <div class="card-grid"></div>
        `;
      },
      choices: function() {
        return cards.map((c, i) => {
          if (c.available) {
            return `<span>${c.label}</span><span style="font-size:0.8em;">${c.revealed ? `${c.value}円` : "&nbsp;"}</span>`;
          } else {
            return c.revealed ? `<span>${c.label}</span><span style="font-size:0.9em;">${c.value}円</span>` : "";
          }
        });
      },
      on_finish: function(data){
        let remain = cards.map((c, i) => c.available ? i : null).filter(i => i !== null);
        let chosenIndex = data.response;
        console.log("remain:", remain);
        cards[chosenIndex].available = false;
        cards[chosenIndex].revealed = true;
        jsPsych.data.write({chosen: chosenIndex});
      },
      button_html: '<button class="choice-card">%choice%</button>',
      on_load: function() {
        console.log(jsPsych.data.get().values());
        const btns = document.querySelectorAll('.choice-card');
        btns.forEach((btn, i) => {
          if (!cards[i].available) {
            btn.disabled = true;
            btn.style.background = "#fff";
            btn.style.border = "2px solid #fff";
            btn.style.color = "#fff";
            btn.style.cursor = "default";
          }
          if (cards[i].revealed) {
            btn.innerHTML = `${cards[i].label}<br><span style="font-size:0.9em;">${cards[i].value}円</span>`;
          }
        });
      }
    };
  }

// Practice5 決定2
  var decisionTrial2 = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function(){
      var last_choice = jsPsych.data.get().last(1).values()[0].chosen;
      let html = `
        <h3>練習　ラウンド2　ー決定フェーズー</h3>
        <p>${cards[last_choice].label} の金額は <b>750円</b> です。</p>`;
      html += `<div style="display:flex;flex-direction:row;justify-content:center;align-items:flex-end;gap:12px;margin:24px 0;">`;
      for(let i=0; i<cards.length; i++){
        if (!cards[i].available && i !== last_choice) { //空白ボタン
          html += `
            <button
              class="choice-card"
              style="
                width:75px;height:100px;
                border:2px solid #fff;
                border-radius:12px;
                background:#fff;
                color:#fff;
                font-size:1.1em;font-weight:bold;
                display:flex;flex-direction:column;justify-content:center;align-items:center;
                box-sizing:border-box;
              "
              disabled
            >
              <span>&nbsp;</span>
              <span style="font-size:0.9em;">&nbsp;</span>
            </button>
          `;
          continue;
        } // 通常ボタン
        html += `
          <button
            class="choice-card"
            style="
              width:75px;height:100px;
              border:${i === last_choice ? '4px' : '2px'} solid ${i === last_choice ? '#e91e63' : '#888'};
              border-radius:12px;
              background:${cards[i].revealed ? '#fff' : '#fff'};
              color:#000;
              font-size:1.1em;font-weight:bold;
              display:flex;flex-direction:column;justify-content:center;align-items:center;
              box-sizing:border-box;
            "
            disabled
          >
            <span>${cards[i].label}</span>
            <span style="font-size:0.9em;">
              ${
                i === last_choice
                  ? "750円"
                  : (cards[i].revealed ? `${cards[i].value}円` : "")
              }
            </span>
          </button>
        `;
      }
      html += `</div>`;
      html += `
        <p>このカードに決定しますか？</p>
        <p style="font-size:0.8em;">練習として、ここでは「はい」を選択してください</p>
      `;
      return html;
    },
    choices: ["はい", "いいえ"],
    button_html: [
      '<button class="jspsych-btn">%choice%</button>', // はいボタン有効
      '<button class="jspsych-btn" disabled>%choice%</button>' // いいえボタン無効
    ],
    on_finish: function(data){
      data.decision = 0; // 強制的に「はい」
    }
  };
// Practice6 結果2
  var resultTrial2 = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function(){
      var last_choice = jsPsych.data.get().last(2).values()[0].chosen;
      return `<p>あなたが選んだカードは他の参加者に獲得されました。ラウンド3の選択フェーズに進みます。</p>`;
    },
    choices: ["次へ"]
  };

//--------ROUND 3(カード7枚、はい強制)---------------------------------------------------------------
// Practice7 選択3
  function getChoiceTrial3() {
    return {
      type: jsPsychHtmlButtonResponse,
      on_start: function() {
        const trials = jsPsych.data.get().filter({chosen: true}).values();
          if (trials.length > 0) {
            const last_choice = trials[trials.length - 1].chosen;
            cards[last_choice].available = false;
          }
      },
      stimulus: `
        <h3>練習　ラウンド3　ー選択フェーズー</h3>
        <p>選べるカードは7枚です。7枚のカードの中からめくるカードを1枚選んでください。</p>
        <div class="card-grid"></div>
      `,
      choices: function() {
        return cards.map((c, i) => {
          if (c.available) {
            return `<span>${c.label}</span><span style="font-size:0.8em;">${c.revealed ? `${c.value}円` : "&nbsp;"}</span>`;
          } else {
            return c.revealed ? `<span>${c.label}</span><span style="font-size:0.9em;">${c.value}円</span>` : "";
          }
        });
      },
      on_finish: function(data){
        let chosenIndex = data.response;
        cards[chosenIndex].revealed = true;
        jsPsych.data.write({chosen: chosenIndex});
      },
      on_load: function() {
        const btns = document.querySelectorAll('.choice-card');
        btns.forEach((btn, i) => {
          if (!cards[i].available) {
            btn.disabled = true;
            btn.style.background = "#fff";
            btn.style.border = "2px solid #fff";
            btn.style.color = "#fff";
            btn.style.cursor = "default";
          }
          if (cards[i].revealed) {
            btn.innerHTML = `${cards[i].label}<br><span style="font-size:0.9em;">${cards[i].value}円</span>`;
          }
        });
      },
      button_html: '<button class="choice-card">%choice%</button>',
    };
  }
// Practice8 決定3
  var decisionTrial3 = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function(){
      var last_choice = jsPsych.data.get().last(1).values()[0].chosen;
      var value = cards[last_choice].value;
      let html = `
        <h3>練習　ラウンド3　ー決定フェーズー</h3>
        <p>${cards[last_choice].label} の金額は <b>${value}円</b> です。</p>`;
      html += `<div style="display:flex;flex-direction:row;justify-content:center;align-items:flex-end;gap:12px;margin:24px 0;">`;
      for(let i=0; i<cards.length; i++){
        if (!cards[i].available && i !== last_choice) {// 空白ボタン
          html += `
            <button
              class="choice-card"
              style="
                width:75px;height:100px;
                border:2px solid #fff;
                border-radius:12px;
                background:#fff;
                color:#fff;
                font-size:1.1em;font-weight:bold;
                display:flex;flex-direction:column;justify-content:center;align-items:center;
                box-sizing:border-box;
              "
              disabled
            >
              <span>&nbsp;</span>
              <span style="font-size:0.9em;">&nbsp;</span>
            </button>
          `;
          continue;
        }
        html += `
          <button
            class="choice-card"
            style="
              width:75px;height:100px;
              border:${i === last_choice ? '4px' : '2px'} solid ${i === last_choice ? '#e91e63' : '#888'};
              border-radius:12px;
              background:${cards[i].revealed ? '#fff' : '#fff'};
              color:#000;
              font-size:1.1em;font-weight:bold;
              display:flex;flex-direction:column;justify-content:center;align-items:center;
              box-sizing:border-box;
            "
            disabled
          >
            <span>${cards[i].label}</span>
            <span style="font-size:0.9em;">
              ${cards[i].revealed ? `${cards[i].value}円` : ""}
            </span>
          </button>
        `;
      }
      html += `</div>`;
      html += `<p>このカードに決定しますか？</p>
              <p style="font-size:0.8em;">練習として、ここでは「はい」を選択してください</p>`;
      return html;
    },
    choices: ["はい", "いいえ"],
    button_html: [
      '<button class="jspsych-btn">%choice%</button>', 
      '<button class="jspsych-btn" disabled>%choice%</button>'
    ],
    on_finish: function(data){
      data.decision = 0; // 「はい」
    }
  };
// Practice9 結果3
  var resultTrial3 = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function(){
      var last_choice = jsPsych.data.get().last(2).values()[0].chosen
      return `<p>おめでとうございます！あなたは${cards[last_choice].label}のカード（${cards[last_choice].value}円）を獲得しました！</p>`;
    },
    choices: ["次へ"]
  };

// 確認テスト
// Q1
const confirmTestQ1 = {
  type: jsPsychSurveyMultiChoice,
  preamble: "<h3>確認テスト Q1</h3>",
  questions: [
    {
      prompt: "1度選択したカードはもう一度選択することができる。",
      name: "q1",
      options: ["〇", "✕"]
    }
  ],
  button_label: "答えをみる"
};

const confirmTestQ1Feedback = {
  type: jsPsychHtmlButtonResponse,
  stimulus: function() {
    const last = jsPsych.data.get().last(1).values()[0].response.q1;
    if (last === "〇") {
      return `<p style="line-height:1.8;"><b>正解です！</b><br>カードが画面上に表示されている限り、1度選択したカードを再度選択することができます。</p>`;
    } else {
      return `<p style="line-height:1.8;"><b>不正解です。</b><br>カードが画面上に表示されている限り、1度選択したカードを再度選択することができます。</p>`;
    }
  },
  choices: ["次へ"]
};

// Q2
const confirmTestQ2 = {
  type: jsPsychSurveyMultiChoice,
  preamble: "<h3>確認テスト Q2</h3>",
  questions: [
    {
      prompt: "あなたの画面で金額が表示されているカードは、他の参加者にも同じように金額がわかるように表示されている。",
      name: "q2",
      options: ["〇", "✕"]
    }
  ],
  button_label: "答えをみる"
};

const confirmTestQ2Feedback = {
  type: jsPsychHtmlButtonResponse,
  stimulus: function() {
    const last = jsPsych.data.get().last(1).values()[0].response.q2;
    if (last === "✕") {
      return `<p style="line-height:1.8;"><b>正解です！</b><br>金額が表示されるのは選択した本人のみです。<br>あなたが選択したカードに書かれた金額はあなたしか見ることが出来ません。<br>また、他の参加者がめくったカードをあなたが見ることも出来ません。</p>`;
    } else {
      return `<p style="line-height:1.8;"><b>不正解です。</b><br>金額が表示されるのは選択した本人のみです。<br>あなたが選択したカードに書かれた金額はあなたしか見ることが出来ません。<br>また、他の参加者がめくったカードをあなたが見ることも出来ません。</p>`;
    }
  },
  choices: ["次へ"]
};

const downloadQuizResultTrial = {
  type: jsPsychHtmlButtonResponse,
  stimulus: "<p>データを保存しています。<br>しばらくお待ちください。</p>",
  choices: [],
  trial_duration: 1000,
  on_load: function() {
    // クイズ回答データだけ抽出
    const quizData = jsPsych.data.get().filter({trial_type: "survey-multi-choice"}).values();

    const now = new Date();
    const timestamp = now.toISOString();
    // 必要なカラムだけ抜き出し
    const minimal = quizData.map((d, i) => ({
      id: window.id || "",
      quiz_no: i + 1,
      //q: d.questions?.[0]?.prompt ?? "",
      answer: d.response ? Object.values(d.response)[0] : "",
      timestamp: timestamp,
      rt: d.rt || ""

    }));

     // CSV変換
    function toCSV(arr) {
      if (arr.length === 0) return "";
      const header = Object.keys(arr[0]).join(",");
      const rows = arr.map(obj => Object.values(obj).join(","));
      return [header, ...rows].join("\n");
    }
    const quiz_csv = toCSV(minimal);

    // BOM付きでダウンロード
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, quiz_csv], {type: "text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${window.id}_Quiz.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    uploadData(`${window.id}_Quiz.csv`, quiz_csv);
  }
};


//足並みそろえトライアル　Zoomに戻すべきか
const waitTrial = {
  type: jsPsychSurveyText,
  questions: [
    {
      prompt: "Zoomウェビナーの画面を開いてお待ちください。（<span style=\"color:red;\">このタブは閉じないでください</span>）<br>実験スタッフが全員の進行状況を確認した後、Zoomウェビナーのチャット機能でパスワードをお送りします。<br><br>パスワードを入力してください。",
      name: "password",
      required: true,
      input_type: "password"
    }
  ],
  button_label: "進む",
  on_start: function() {
    pauseGlobalTimeout(); // タイマー停止
  },
  on_finish: function(data) {
    // パスワードが違う場合はフラグをセット
    data.correct = (data.response.password === "0802");
    if (!data.correct) {
      alert("パスワードが違います。もう一度入力してください。");
    } else {
      resumeGlobalTimeout();
    }
  }
};

//正しいパスワードを入力するまですすめない
const waitLoop = {
  timeline: [waitTrial],
  loop_function: function(data) {
    // 最後のtrialのdata.correctがtrueなら終了
    return !data.values()[0].correct;
  }
};

    

// 練習フェーズ全体
  return {
    timeline: [
      getChoiceTrial1(),
      decisionTrial1,
      resultTrial1,
      getChoiceTrial2(),
      decisionTrial2,
      resultTrial2,
      getChoiceTrial3(),
      decisionTrial3,
      //practice11 チュートリアル終了
      resultTrial3,
      {
        type: jsPsychHtmlButtonResponse,
        stimulus: "<h3>確認テスト</h3><p>次は、実験内容の理解度を確認するテストです。</p><p>問題は〇✕形式で、全部で2問あります。</p><p>テストの結果は、あなたの報酬額には影響しません。</p>",
        choices: ["確認テストを始める"]
      },
      confirmTestQ1,
      confirmTestQ1Feedback,
      confirmTestQ2,
      confirmTestQ2Feedback,
      {
        type: jsPsychHtmlButtonResponse,
        stimulus: "<h3>練習は以上です。</h3><p>実験の流れを理解できましたか？</p><p>もし分からないことがあれば、Zoomウェビナーのチャット機能で実験スタッフにお知らせください。</p><p>実験の流れが理解できたら、「次へ」ボタンをクリックしてください。</p>",
        choices: ["次へ"]
      },
      downloadQuizResultTrial,
      waitTrial,
      waitLoop,
    ],  
  };
}


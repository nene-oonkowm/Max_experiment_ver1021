// outro.js
//const cards = window.cards;
const rewardExplanationTrial = {
      type: jsPsychHtmlButtonResponse,
      stimulus: function() {
        // survey.jsと同様に、最後に獲得したカードの価値を取得
        const lastCardData = jsPsych.data.get().filter({phase: "decision"}).last(1).values()[0];
        console.log("Last card data:", lastCardData); // デバッグ用
        let value = lastCardData.chosen_value;
        let html = "<h3>報酬のご案内</h3><h5>お疲れさまでした！これで本実験は終了です。<br>以下であなたが受け取る報酬についてご説明しますので、よくお読みください。<br></h5>";
        if (value < 300) {
          html += `
            <p>あなたが実験で獲得したカードの金額が<b>300円未満</b>の場合、<br>実験時間を考慮して、実験報酬として<b>300円</b>をお支払いします。</p>
            <p>したがって、あなたに支払われる報酬は参加報酬200円と合わせて、,<br><b style="font-size: 24px;">300 + 200 = 500円</b>になります。</p>
          `;
        } else {
          html += `
            <p>あなたに支払われる報酬は、参加報酬の200円と合わせて、<br><b style="font-size: 24px;">${value} + 200 = ${value + 200}円</b> になります。</p>
          `;
        }
        html += `
          <p>報酬は後日、当センターに登録されているメールアドレスへ、Amazonギフトでお送りします。</p>
        `;
        return html;
      },
      choices: ["次へ"],
      button_html: '<button class="jspsych-btn">%choice%</button>'
    };

const saveOutroDataTrial = {
      type: jsPsychHtmlButtonResponse,
      stimulus: "<p>データを保存しています。<br>しばらくお待ちください。</p>",
      choices: [],
      trial_duration: 1000,
      on_load: function() {
        // OutroDataだけ抽出
        const outroData = jsPsych.data.get().filter({trial_type: "survey-html-form"}).last(9).values();

    // 1つのオブジェクトにまとめる
        const merged = {
          id: window.id || ""
        };
        outroData.forEach(d => {
          if (d.response) {
            Object.entries(d.response).forEach(([k, v]) => {
              merged[k] = v;
            });
          }
        });

        // ヘッダーと1行だけのCSVにする
        const header = Object.keys(merged).join(",");
        const row = Object.values(merged).join(",");
        const outro_csv = header + "\n" + row;

        // ダウンロード処理
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const blob = new Blob([bom, outro_csv], {type: "text/csv"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${window.id}_OutroData.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        uploadData(`${window.id}_OutroData.csv`, outro_csv)
      }
    };
    

var outro = {
  timeline: [
    {
      type: jsPsychInstructions,
      pages: [
        `<div style="text-align:center; max-width:750px; margin:auto; line-height:1.0;">
          <h1>事後アンケート</h1>
          <p>次のページから始まる質問にお答えください。</p>
          <p>最後までご回答いただくと、報酬に<b>回答ボーナスとして100円</b>が加算されます。</p>
          <p>回答は約5分程度で終わります。</p>
          <p>質問の回答内容は、実験の報酬には影響しませんので、</p>
          <p>安心して正直な回答をお願いいたします。</p>
        </div>`,
      ],
      show_clickable_nav: true,
      allow_backward: false,
      button_label_previous: '戻る',
      button_label_next: '実験を始める',
    },
    {
      type: jsPsychSurveyHtmlForm,
      html: `
        <div style="margin-bottom: 24px;">
          <p><b>1. あなたは実験開始時に、ゲームで獲得する目標金額をどのくらいに設定しましたか？</b></p>
          <p style= font-size:0.9em;>スライダーのボタンを動かして金額をお答えください。</p>
          <label for="q1">金額 (0～1000円):</label>
          <input type="range" id="q1" name="q1" min="0" max="1000" step="50" value="500"
                 oninput="document.getElementById('q1_value').innerText=this.value">
          <span id="q1_value">500</span> 円
        </div>
      `,
      button_label: "次へ"
    },
    {
      type: jsPsychSurveyHtmlForm,
      html: `
        <div style="margin-bottom: 24px;">
          <p><b>2.あなたがカードを決定する際、どんなことを考慮にいれましたか？（複数選択可）</b></p>
          <label><input type="checkbox" name="q2" value="0"> 目標金額（半分以上など）</label><br>
          <label><input type="checkbox" name="q2" value="1"> これまでの選択肢との比較</label><br>
          <label><input type="checkbox" name="q2" value="2"> 残っている選択肢の数</label><br>
          <label><input type="checkbox" name="q2" value="3"> 残りのラウンド</label><br>
          <label><input type="checkbox" name="q2" value="4"> その他</label>
        </div>
      `,
      button_label: "次へ"
    },
    {
      type: jsPsychSurveyHtmlForm,
      html: `
        <div style="margin-bottom: 24px;">
          <p><b>3. その他、カードを決定する際に、考えたこと・悩んだことはありましたか？</b></p>
          <textarea name="q3" rows="3" cols="60"></textarea>
        </div>
      `,
      button_label: "次へ"
    },
    {
      type: jsPsychSurveyHtmlForm,
      html: `
        <div style="margin-bottom: 24px;">
          <p><b>4. ラウンドが進むにつれ、意識や判断基準は変化しましたか？</b></p>
          <label><input type="radio" name="q4" value="0"> 変化した</label><br>
          <label><input type="radio" name="q4" value="1"> 変化しなかった</label>
        </div>
      `,
      button_label: "次へ"
    },
    {
      type: jsPsychSurveyHtmlForm,
      html: `
        <div style="margin-bottom: 24px;">
          <p><b>5. 獲得したいと思っていたカードを他の参加者にとられることがありましたか？</b></p>
          <label><input type="radio" name="q5" value="0" > はい</label><br>
          <label><input type="radio" name="q5" value="1"> いいえ</label>
        </div>
      `,
      button_label: "次へ"
    },
    {
      type: jsPsychSurveyHtmlForm,
      html: `
        <div style="margin-bottom: 24px;">
          <p><b>6. 本実験の目的はなんだったと思いますか？あなたの考えをお聞かせください。</b></p>
          <textarea name="q6" rows="4" cols="60"></textarea>
        </div>
      `,
      button_label: "次へ"
    },
    { //デブリーフィング
      type: jsPsychInstructions,
      html: `
        <div style="margin-bottom: 24px; max-width:700px; font-size:0.9em; text-align:left;">
          <h3 style="text-align:center;">本実験の目的</h3>
          <p>（<b>※お願い</b>：本研究は今後もしばらく継続される予定です。研究の目的が事前に知られてしまうと、参加者の反応に影響を及ぼす可能性があります。そのため、ここに記載された内容を他の方に伝えたり、SNS等に掲載したりすることのないよう、お願い申し上げます。）</p>
          <p>本研究の目的は、競合的な場面において意思決定をするとき、良い選択肢を求めることはどの程度適応的であるかを検討することでした。</p>
          <p>意思決定をする場面において、より良い選択肢を強く求めるほど、幸福度や人生満足度が下がることが、社会心理学の研究から示されています（Schwartz et al. 2002）。</p>
          <p>しかし、このようにより良い選択肢を求める人が、実際により良い選択肢を獲得しているのか、という点については未だ十分な検討がされていません。本研究ではここに着目し、より良い選択肢を求める人が、同じ選択肢を複数の人が求める場面において、実際に良い選択肢を獲得できるのかを、確率的に行動するエージェントとの競合によるオンライン実験によって検討しました。</p>
          <p>ご質問やご意見がある場合には、以下のメールアドレスまでご連絡ください。</p>
          <p>csep@lynx.let.hokudai.ac.jp（担当：結城雅樹）</p>
          <p><br>読み終わった方は「次へ」ボタンを押して進んでください。</p>
        </div>
      `,
      button_label: "次へ"
    },
    {
      type: jsPsychSurveyHtmlForm,
      html: `
        <div style="margin-bottom: 24px;">
          <p><b>7. その他、本実験に関して何か気づいたことやコメントがあれば、自由にお書きください。</b></p>
          <textarea name="q7" rows="4" cols="60"></textarea>
        </div>
      `,
      button_label: "次へ"
    },
    // 報酬説明trialをoutro.jsに追加*/
    rewardExplanationTrial,
    saveOutroDataTrial,
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: `
        <p style="color:red;"><b>この画面はまだ閉じないでください。</b></p>
        <p><b>Zoomウェビナーのチャット機能で<br>実験スタッフに実験が終了したことを連絡してください。</b></p>
        <p>実験データが正常に保存されたことを確認した後、<br>実験者からZoomのチャット機能で連絡があります。</p>
        <p>連絡があるまでは、この画面を閉じたり、更新したりしないでください。</p>
      `,
      return: function() {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
      },
      choices: ['終了'],
      onload: function() {
        pauseGlobalTimeout(); // タイマー再開
      },

    }
  ],
};  // outro.jsのtimelineに追加



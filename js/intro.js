// intro.js

// Intro1 ウェルカム~実験開始画面
const intro1 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `<div style="text-align:center;">
    <h2>ご参加ありがとうございます</h2>
    <p>全員そろい次第実験を開始します。</p>
    <p>携帯電話の電源をお切りください。</p>
  </div>`,
  choices: "NO_KEYS",
  trial_duration: 10 // 10秒（10000ミリ秒） デモのため短縮
};


const intro2 = {
  type: jsPsychInstructions,
  pages: [
    // Intro2 実験開始画面
    `<div style="text-align:left">
      <h2>これから実験を開始します</h2>
    </div>`
    
  ],
  
  show_clickable_nav: true,      // 次へ/戻るボタンを表示
  allow_backward: false,         // 戻るを禁止
  button_label_next: '次へ',     // ボタン文言
  button_label_previous: '戻る', // 使わないが一応
};

// Intro3 参加者ID入力
const intro3_id = {
  type: jsPsychSurveyText,
  questions: [
    {
      prompt: "<b>北大社会心理学実験システムのユーザーID</b>を入力してください。<p style='color:red;'>(謝礼をお支払いするために重要なステップなので、正確にご記入ください。)</p>", 
      name: "ID",
      required: true,
    }
  ],
  button_label: "次へ",
  on_finish: function(data){
    // 入力されたIDをグローバル変数やwindowオブジェクトに保存
    window.id = data.response.ID;
    console.log("Participant ID:", window.id); // デバッグ用
    resetGlobalTimeout();
  }
};

const intro4 = {
  type: jsPsychInstructions,
  pages: [
    //Intro4 実験上の注意  
    `<div style="text-align:left; max-width:900px; margin:auto; line-height:1.8;">
      <h2>実験時の注意</h2>
      <p>ご自身の<b>ＰＣ</b>でご参加ください。（スマートフォン・タブレット使用不可）</p>
      <h4>◆禁止事項◆</h4>
      <ul>
        <li>実験中は、<b>画面を閉じたり、更新(再読み込み)したりしないでください。</b></li>
        <li><b>お席を離れないでください。3分以上画面操作がない場合は、システムが自動終了します。</b></li>
        <li>周りの人と相談したり、実験以外の作業をしたりしないでください。</li>
        <li>携帯電話の電源はお切りください。</li>
      </ul>
      <h4>◆Zoomウェビナーについて◆</h4>
      <ul>
        <li>Zoomウェビナーはつないだままで、質問時以外は<b>画面を最大化</b>してください。
        <br>質問時はESCキーで画面最大化を解除することが出来ます。</li>
        <li>質問・トラブルはZoomウェビナーのチャット機能で、実験スタッフにお知らせください。<br>(<span style = color:red;>画面の更新・再読み込みはしないでください</span>)</li>
        <li><span style="color:red;">実験者の指示があるまでは、Zoomウェビナーから退出しないでください。</span></li>
      </ul>
      <p>読み終わったら「次へ」ボタンをクリックしてください。説明が続きます。
      <br>前のページに戻るときは、「戻る」ボタンをクリックしてください。</p>
    </div>`,

    // Intro5 実験の概要
    `<div style="text-align:left; max-width:950px; margin:auto; line-height:1.8;">
      <h2>実験の概要</h2>
      <p>この実験には、<b>10人の参加者</b>が参加しています。</p>
      <p>実験では、10人で同時にカード選択を行っていただきます。
      <br>実験中に、参加者同士がコミュニケーションを取ることはありません。
      <br>参加者同士が行動をお互いに見ることはなく、またIDなどが他の参加者に知られることはありません。</p>
      <p>実験時間は<b>30分程度</b>を予定しています。</p>
      </ul>
    </div>`,
    //報酬について
    `<div style="text-align:left; max-width:950px; margin:auto; line-height:1.8;">
      <h2>報酬について</h2>
      <p>実験後にお渡しする報酬金額は、以下の3つの合計になります。</p>
      <ol>
        <li><span style="font-size: 1.3em;"><b>参加報酬</b></span> (100円) :実験参加への謝礼としてお支払いします。</li>
        <li><span style="font-size: 1.3em;"><b>ゲーム報酬</b></span> (<b style = color:red;>0~1000円</b>) :実験中に獲得したカードの金額がそのままゲーム報酬となります。</li>
        <li><span style="font-size: 1.3em;"><b>アンケート報酬</b></span> (100円) :事後アンケート(5分程度)に回答し、実験に最後まで参加すると支払われます。</li>
      </ol>
      <p>途中で実験への参加を中止した場合は、その時点で支払い条件を満たしている報酬をお支払いします。</p>
      <img src="img/reward.png" alt="" style="display:block; margin:16px auto; width:1000px;">
    </div>`,
    // Intro6 実験説明１(全体像) 
    `<div style="text-align:left; max-width:900px; margin:auto; line-height:1.8;">
      <h2>実験説明</h2>
      <p>これから、画面に10枚のカードが並びます。</p>
      <p>カードには<b style="color:red;">0円から1000円</b>の間の金額が、そのカードの価値として割り当てられていますが、<br>選ぶまでその価値は分かりません。</p>
      <p><b>10枚のカードを、あなたを含めた10人の参加者が同時に選んでいます。</b></p>
      <p>獲得したカードの金額がゲーム報酬として支払われます。</p>
      <img src="img/intro1.png" alt="" style="width:500px; display:block; margin:16px auto; width:750px;">
    </div>`,

    // Intro7 実験説明２（選択フェーズと意思決定フェーズ）
    `<div style="text-align:left; max-width:1000px; margin:auto; display: flex; align-items: center; line-height:1.8;">
      <span>
        <h3>選択と決定</h3>
        <p>1ラウンドは次の2つのフェーズに分かれています。</p>
        <h4 style="color:#156082; font-size: 1.4em;">選択フェーズ</h4>
        <ul>
          <li style="padding-left: 1em;">あなたはカードを1枚選んでめくり、そのカードの金額を確認します。</li>
          <li style="padding-left: 1em;">めくったカードに書かれた金額はあなたしか見ることが出来ません。</li>
          <li style="padding-left: 1em;">他の人がめくったカードの金額をあなたが見ることも出来ません。</li>
        </ul>
        <h4 style="color:#E97132; font-size: 1.4em;">決定フェーズ</h4>
        <ul>
          <li style="padding-left: 1em;">選んだカードをこのカードに決定するか、<br>決定せずに次のラウンドに進み、カードを再選択するかを選びます。</li>
          <li style="padding-left: 1em;">もし<b>あなたと同じカードで決定した参加者が他にいなければ</b>あなたがそのカードを獲得できます。</li>
          <li style="padding-left: 1em;">もし複数人が同じカードで決定した場合、獲得者はランダムで選ばれます。</li>
          <li style="padding-left: 1em;">決定しなかった場合でも、次のラウンドでまた同じカードを選ぶことが出来ます。</li>
        </ul>
      </span>
      <img src="img/intro2.png" style="width:350px; height:auto; margin-left:5px;">
    </div>`,

    // Intro8 実験説明３（再選択と繰り返し）
    `<div style="text-align:left; max-width:1000px; max-height:500px; margin:auto; display: flex; align-items: flex-start; line-height:1.8;">
      <span>
        <h3>再選択と繰り返し</h3>
        <p>カードを獲得できなかった場合（＝決定しなかった場合、<br>または他の参加者に獲得された場合）は、再び選択フェーズに戻り、新しいカードを選びます。</p>
        <p>最終的にカードを獲得するまで、この流れを繰り返します。</p>
        <p>カードを1枚獲得した時点で、実験終了となります。</p>
      </span>
      <img src="img/intro3.png" style="width:450px; height:auto; margin-left:5px;">
    </div>`,

    // Intro9 実験説明４（カードの減少）
    `<div style="text-align:left; max-width:750px; margin:auto; line-height:1.8;">
      <h3>カードの減少</h3>
      <p>カードを獲得した参加者が出ると、そのカードは画面から消えます。</p>
      <p>つまり、<b>他の参加者が獲得したカードを選ぶことはできません。</b></p>
      <p>すでに、他の参加者が獲得したカードは画面から消えていきます。</p>
      <img src="img/intro4.png" alt="" style="width:500px; display:block; margin:16px auto; width:750px;">
    </div>`,

    // Intro10 実験説明５（ランダム終了など）　終了ラウンド数未定
    `<div style="text-align:left; max-width:750px; max-height:500px; margin:auto; line-height:1.8; align-items: flex-start;">
      <h3>ランダム終了</h3>
      <p>カードが残り1枚になった場合、または実験が12ラウンド目に入った場合は、</p>
      <p><b>残っているカードが、まだカードを獲得していない参加者にランダムに割り当てられます。</b></p>
      <p>あなたが割り当てられたカードの金額が、あなたのゲーム報酬となります。</p>
      <img src="img/intro5.png" alt="" style="width:600px; display:block; margin:16px auto;">
    </div>`,

    // Intro11 実験説明６（確認）
    `<div style="text-align:left; max-width:750px; margin:auto; line-height:1.8;">
      <p>以上で実験についての説明は終わりです。分からないないところがありましたら、<br>「戻る」ボタンをクリックして前のページに戻り、もう一度説明を読み直してください。</p>
      <p>また、説明を読んでも分からないところがありましたら、Zoomウェビナーのチャット機能で実験者にお知らせください。<br></p>
      <p>実験の内容を十分理解できたと思ったら、「次へ」ボタンをクリックしてください。練習問題に進みます。<br>(<span style="color:red;">練習問題に進むと、説明には戻れなくなります。</span>)</p>
    </div>`
  ],
  
  show_clickable_nav: true,      // 次へ/戻るボタンを表示
  allow_backward: true,         // 戻るを禁止
  button_label_next: '次へ',     // ボタン文言
  button_label_previous: '戻る', // 使わないが一応
  // ※キーボードの左右矢印でも進めます

}

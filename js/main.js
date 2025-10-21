// main.js (timeline結合用)
const jsPsych = initJsPsych({
  on_finish: function() {
    jsPsych.data.get().localSave('csv', 'data.csv');
  }
});

const timeline = [
  {
    type: jsPsychHtmlButtonResponse,
    stimulus: '実験を開始します',
    choices: ['OK']
  },
];

function uploadData(filename, csvData) {
        fetch("/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: filename, data: csvData })
        })
        .then(response => response.text())
        .then(result => {
          console.log("Upload success:", result);
        })
        .catch(err => console.error("Upload error:", err));
      } 
// --- ここからグローバル無操作タイマー ---
let globalTimeout = null;
let warningTimeout = null;
let globalTimeoutPaused = false; 

function resetGlobalTimeout() {
   if (globalTimeoutPaused) return; 
  if (globalTimeout) clearTimeout(globalTimeout);
  if (warningTimeout) clearTimeout(warningTimeout);

  // 150秒後（30秒前）に警告
  warningTimeout = setTimeout(() => {
    alert("あと30秒で自動終了します。操作を行ってください。");
  }, 150000);

  // 180秒後にシステム終了
  globalTimeout = setTimeout(() => {
    alert("3分間操作がなかったため、システムを終了します。");
    window.location.href = "about:blank"; // または終了画面などに遷移
  }, 180000);
}

// ユーザー操作イベントでタイマーリセット
["mousedown", "mousemove", "keydown", "scroll", "touchstart"].forEach(event => {
  window.addEventListener(event, resetGlobalTimeout, true);
});

// --- ここまでグローバル無操作タイマー ---

// タイマー一時停止関数
function pauseGlobalTimeout() {
  globalTimeoutPaused = true; 
  if (globalTimeout) {
    clearTimeout(globalTimeout);
    globalTimeout = null;
  }
  if (warningTimeout) {
    clearTimeout(warningTimeout);
    warningTimeout = null;
  }
  console.log("Global timeout paused.");
}

function resumeGlobalTimeout() {
  globalTimeoutPaused = false; // ← 追加
  resetGlobalTimeout();
  console.log("Global timeout resumed.");
}


// 各フェーズを追加
timeline.push(intro1);
timeline.push(intro2);
timeline.push(intro3_id);
timeline.push(intro4);
timeline.push(practice_intro);
timeline.push(createPractice(jsPsych));
timeline.push(createSurvey(jsPsych));
timeline.push(outro);

// 実行
jsPsych.run(timeline);



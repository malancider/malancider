import { useRef, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import emailjs from "emailjs-com";
const Popover = ({ data }) => {

  if (!data) return null;
// popover setting
  return (
    <div
      id="global-popover"
      style={{
        position: "fixed",
        left: data.x,
        top: data.y,
        transform: data.flip
          ? "translate(-50%, 10px)"
          : "translate(-50%, calc(-100% - 10px))",
        background: "#222",
        color: "white",
        padding: "10px 12px",
        borderRadius: 6,
        fontSize: 15,
        maxWidth: 260,
        boxShadow: "0 0 10px rgba(0,0,0,0.6)",
        zIndex: 9999,
        lineHeight: 1.6
      }}
    >

      <div
        style={{
          position: "absolute",
          width: 10,
          height: 10,
          background: "#222",
          left: "50%",
          transform: "translateX(-50%) rotate(45deg)",
          ...(data.flip
            ? { top: -5 }
            : { bottom: -5 })
        }}
      />
      {data.content}
    </div>
  );
};
function PresetModal({ mode, presets, onClose, onConfirm }) {
  const [inputValue, setInputValue] = useState("");

  const titleMap = { save: "프리셋 저장", delete: "프리셋 삭제", load: "프리셋 불러오기" };
  const confirmMap = { save: "확인", delete: "삭제", load: "불러오기" };

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0,
        width: "100%", height: "100%",
        background: "rgba(0,0,0,0.7)",
        display: "flex", justifyContent: "center", alignItems: "center",
        zIndex: 1000
      }}
    >
      <div
        style={{
          background: "#222", padding: 20,
          borderRadius: 8, width: 300,
          display: "flex", flexDirection: "column", gap: 12
        }}
      >
        <h3 style={{ margin: 0 }}>{titleMap[mode]}</h3>

        {mode === "save" ? (
          <input
            type="text"
            placeholder="프리셋 이름 입력"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ width: "100%", marginTop: 10, padding: 5 }}
          />
        ) : (
          <select
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ width: "100%", marginTop: 10 }}
          >
            <option value="" disabled>
              {mode === "delete" ? "삭제할 프리셋 선택" : "불러올 프리셋 선택"}
            </option>
            {presets.map((p, i) => (
              <option key={i} value={i} title={p.name}>
                {p.name.length > 18 ? p.name.slice(0, 18) + "..." : p.name}
              </option>
            ))}
          </select>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 5 }}>
          <button onClick={onClose}>취소</button>
          <button
            onClick={() => onConfirm(inputValue)}
            disabled={mode !== "save" && inputValue === ""}
          >
            {confirmMap[mode]}
          </button>
        </div>
      </div>
    </div>
  );
}
function Tooltip({ text }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const tooltipEl = visible
    ? ReactDOM.createPortal(
        <div
          style={{
            position: "fixed",
            left: pos.x,
            top: pos.y,
            transform: "translate(-50%, 10px)",
            background: "#222",
            color: "white",
            padding: "8px 10px",
            borderRadius: 6,
            fontSize: 15,
            width: 240,
            boxShadow: "0 0 8px rgba(0,0,0,0.5)",
            zIndex: 99999,
            textAlign: "left",
            lineHeight: 1.4,
            whiteSpace: "pre-line",
            pointerEvents: "none"
          }}
        >
          {text}
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <span
        style={{ display: "inline-block", marginLeft: 6 }}
        onMouseEnter={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setPos({ x: rect.left + rect.width / 2, y: rect.bottom });
          setVisible(true);
        }}
        onMouseLeave={() => setVisible(false)}
      >
        <span
          style={{
            cursor: "help",
            border: "1px solid white",
            borderRadius: "50%",
            width: 18,
            height: 18,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            background: "#222"
          }}
        >
          ?
        </span>
      </span>
      {tooltipEl}
    </>
  );
}
function MemoEditor({ index, initialText, onSave, onClose }) {
  const [text, setText] = useState(initialText);

  useEffect(() => {
    return () => {
      onSave(text);
    };
  }, [text]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: 13 }}>랩 메모</div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{
          width: 220,
          height: 100,
          resize: "none"
        }}
      />

      <button onClick={onClose}>
        닫기
      </button>
    </div>
  );
}
export default function App() {
  const videoRef = useRef(null);
  const hiddenCanvasRef = useRef(null);
  const hiddenCtxRef = useRef(null);
  const presetButtonRef = useRef(null);
  const saveButtonRef = useRef(null);

const formRef = useRef();
// ===== 공지사항 =====
const [notices, setNotices] = useState([]);

useEffect(() => {
  fetch("/Notice.json?v=" + Date.now())
    .then((res) => res.json())
    .then((data) => setNotices(data))
    .catch(() => {});
}, []);

// 최신 공지 1개
const [noticeModalOpen, setNoticeModalOpen] = useState(false);
const [selectedNotice, setSelectedNotice] = useState(null);
const latestNotice = notices[0];
const [contactOpen, setContactOpen] = useState(false);
const [contactCategory, setContactCategory] = useState("버그 제보");
const [contactTitle, setContactTitle] = useState("");
const [contactEmail, setContactEmail] = useState("");
const [contactContent, setContactContent] = useState("");
const [nextContactTime, setNextContactTime] = useState(0);

  const [stream, setStream] = useState(null);
const [isVideoHidden, setIsVideoHidden] = useState(false);
const [regionOffsetHidden, setRegionOffsetHidden] = useState(0);
const [regionOffsetVisible, setRegionOffsetVisible] = useState(0);
const regionOffsetY = isVideoHidden ? regionOffsetHidden : regionOffsetVisible;
const setRegionOffsetY = (val) => {
  if (isVideoHidden) {
    setRegionOffsetHidden(typeof val === "function" ? val(regionOffsetHidden) : val);
  } else {
    setRegionOffsetVisible(typeof val === "function" ? val(regionOffsetVisible) : val);
  }
};
const [draggingCardId, setDraggingCardId] = useState(null);
const [draggingX, setDraggingX] = useState(0);
const dragStartXRef = useRef(0);
const dragStartIndexRef = useRef(0);
const sectionDragStartYRef = useRef(0);
const sectionDragStartOffsetRef = useRef(0);
const [isSectionDragging, setIsSectionDragging] = useState(false);
const CARD_WIDTH = 225;
const [draggingTargetIndex, setDraggingTargetIndex] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [currentSelection, setCurrentSelection] = useState(null);
  const [replaceTargetId, setReplaceTargetId] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [regions, setRegions] = useState([]);
  const [globalDetectionPaused, setGlobalDetectionPaused] = useState(false);
  const globalDetectionPausedRef = useRef(globalDetectionPaused);
  /* ================= 타이머 ================= */
const [repeatTimers, setRepeatTimers] = useState([]);
/* ================= 스톱워치 ================= */
const [stopwatchTime, setStopwatchTime] = useState(0);
const [stopwatchRunning, setStopwatchRunning] = useState(false);
const [laps, setLaps] = useState([]);
const [linkWithRepeat, setLinkWithRepeat] = useState(false);
const [currentLapTime, setCurrentLapTime] = useState(0);
const [lapDeleteLock, setLapDeleteLock] = useState(true);
const [iconDetectLinked, setIconDetectLinked] = useState(false);
const isDetectionPaused =
  iconDetectLinked
    ? !stopwatchRunning
    : globalDetectionPaused;
const iconDetectLinkedRef = useRef(iconDetectLinked);
const stopwatchRunningRef = useRef(stopwatchRunning);

/* ================= Popover ================= */
const [toast, setToast] = useState(null);
const showToast = (message, duration = 7000) => {
  const id = Date.now();

  setToast({ id, message });

  setTimeout(() => {
    setToast((t) => (t && t.id === id ? null : t));
  }, duration);
};

const [popover, setPopover] = useState(null);

const showPopover = (event, content, options = {}) => {

  let rect;
  if (event?.currentTarget) {
    rect = event.currentTarget.getBoundingClientRect();
  }
  else if (presetButtonRef.current) {
    rect = presetButtonRef.current.getBoundingClientRect();
  } else {
    return;
  }

  const id = Date.now();
  const flip = rect.top < 120;
  setPopover({
    id,
    x: rect.left + rect.width / 2,
    y: flip ? rect.bottom : rect.top,
    flip,
    content,
  });

  if (options.autoClose !== false) {
    setTimeout(() => {
      setPopover((p) => (p && p.id === id ? null : p));
    }, 10000);
  }
};
const openNoticeModal = (e) => {
  setSelectedNotice(notices[0]);
  setNoticeModalOpen(true);
};
useEffect(() => {
  if (!popover) return;
  const close = (e) => {
    if (isSelecting && popover.id === "save-hint") return;
    const pop = document.getElementById("global-popover");
    if (pop && pop.contains(e.target)) return;
    setPopover(null);
  };

  window.addEventListener("mousedown", close);

  return () => window.removeEventListener("mousedown", close);

}, [popover, isSelecting]);
const [hoverMemoIndex, setHoverMemoIndex] = useState(null);

  const pixelDiffThreshold = 15;
  const loadingRef = useRef(true);
  const [presets, setPresets] = useState(() => {
  const saved = localStorage.getItem("maple_timer_presets");
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
});
const [presetModal, setPresetModal] = useState(null); // "save" | "delete" | "load" | null
  /* ================= 설정 저장 ================= */

const buildData = () => ({
  isVideoHidden,
  regions: regions.map(r => ({
    id: r.id,
    selection: r.selection,
    timerDuration: r.timerDuration,
    sound: r.sound,
    volume: r.volume,
    restartDetectTime: r.restartDetectTime,
    playSoundOnStart: r.playSoundOnStart,
    detectionEnabled: r.detectionEnabled
  })),
  repeatTimers: repeatTimers.map(t => ({
    id: t.id,
    duration: t.duration,
    sound: t.sound,
    volume: t.volume,
    repeat: t.repeat
  })),
  stopwatchTime,
  currentLapTime,
  laps,
  linkWithRepeat,
  lapDeleteLock,
  iconDetectLinked,
  regionOffsetHidden,
  regionOffsetVisible
});

const saveSettings = () => {
  if (
    regions.length === 0 &&
    repeatTimers.length === 0 &&
    laps.length === 0 &&
    stopwatchTime === 0
  ) return;

  localStorage.setItem("maple_timer_settings", JSON.stringify(buildData()));
};
const savePreset = (customName, event) => {

  const now = new Date();

  const autoName =
    String(now.getMonth()+1).padStart(2,"0") +
    "/" +
    String(now.getDate()).padStart(2,"0") +
    " " +
    String(now.getHours()).padStart(2,"0") +
    ":" +
    String(now.getMinutes()).padStart(2,"0");

  const name = customName.trim() === "" ? autoName : customName;

const newPreset = {
    name,
    data: buildData()
  };

  setPresets(prev=>{
    let updated=[newPreset,...prev];
    if(updated.length>5) updated=updated.slice(0,5);
    localStorage.setItem("maple_timer_presets",JSON.stringify(updated));
    return updated;
  });

showToast("저장 성공!");
};
const resetToInitialSettings = (event) => {

  showPopover(
    event,
    <>
      현재 설정을 초기 상태로 되돌립니다.
      <br/>
      저장된 프리셋은 유지됩니다.
      <br/><br/>
      계속하시겠습니까?

      <div style={{marginTop:8, display:"flex", gap:6}}>
        <button onClick={()=>{

        localStorage.removeItem("maple_timer_settings");

setRegions([]);
setRepeatTimers([]);

setStopwatchTime(0);
setCurrentLapTime(0);
setStopwatchRunning(false);
setLaps([]);

setLinkWithRepeat(false);
setLapDeleteLock(true);
setIsVideoHidden(false);

setPopover(null);

        }}>
          확인
        </button>

        <button onClick={()=>setPopover(null)}>
          취소
        </button>
      </div>
    </>,
    { autoClose:false }
  );
};
const exportPresets = (event) => {
  if (presets.length === 0) {
    showToast("내보낼 프리셋이 없습니다.");
    return;
  }

  let fileName = "preset";

  showPopover(
    event,
    <>
      현재 설정값을 파일로 내보냅니다.
      <div style={{ marginTop: 8, marginBottom: 8 }}>
        <input
          type="text"
          defaultValue=""
          onChange={(e) => { fileName = e.target.value; }}
          style={{ width: "100%", boxSizing: "border-box" }}
          placeholder="파일 이름 입력"
        />
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={() => {
          const name = fileName.trim() === "" ? "preset" : fileName.trim();
          const blob = new Blob([JSON.stringify(presets, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${name}.json`;
          a.click();
          URL.revokeObjectURL(url);
          setPopover(null);
        }}>
          확인
        </button>
        <button onClick={() => setPopover(null)}>
          취소
        </button>
      </div>
    </>,
    { autoClose: false }
  );
};

const importPresets = (file) => {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!Array.isArray(parsed)) throw new Error();
      const merged = [...parsed, ...presets];
      const deduped = merged.slice(0, 5);
      setPresets(deduped);
      localStorage.setItem("maple_timer_presets", JSON.stringify(deduped));
      showToast("프리셋 가져오기 성공!");
    } catch {
      showToast("파일 형식이 올바르지 않습니다.");
    }
  };
  reader.readAsText(file);
};
const deletePreset = (index, event) => {

  const updated = presets.filter((_,i)=>i!==Number(index));
  setPresets(updated);
  localStorage.setItem(
    "maple_timer_presets",
    JSON.stringify(updated)
  );

showToast("삭제 성공!");
};
const loadPreset = (preset, event) => {

  const data = preset.data;
  setRepeatTimers(
    data.repeatTimers.map(t => ({
      ...t,
      id: Date.now()+Math.random(),
      timeLeft: t.duration,
      running:false,
      repeat: t.repeat ?? true
    }))
  );

setStopwatchTime(data.stopwatchTime || 0);
  setCurrentLapTime(data.currentLapTime || 0);
  setLaps(data.laps || []);
  setLinkWithRepeat(data.linkWithRepeat || false);
  setLapDeleteLock(data.lapDeleteLock ?? true);
if (data.regionOffsetHidden !== undefined) setRegionOffsetHidden(data.regionOffsetHidden);
  if (data.regionOffsetVisible !== undefined) setRegionOffsetVisible(data.regionOffsetVisible);
  if (data.isVideoHidden !== undefined) setIsVideoHidden(data.isVideoHidden);

  const restored = data.regions.map(r => {

    const previewRef = { current: document.createElement("canvas") };
    previewRef.current.width=75;
    previewRef.current.height=75;

    return {
      ...r,
      previewRef,
      timeLeft:0,
      timerRunning:false,
      detectionEnabled:r.detectionEnabled ?? true,
      lastBottomFrame:null,
      lastTopFrame:null,
      pendingTrigger:false,
      pendingFrames:[]
    };
  });

  setRegions(restored);

showToast("불러오기 성공!");
};
  /* ================= 사운드 목록 ================= */
const SOUND_LIST = [
  { file: "sfx_emer_alert.wav", label: "경고음" },
  { file: "sfx_Frog.wav", label: "개구리" },
  { file: "sfx_Game_1.wav", label: "게임효과음1" },
  { file: "sfx_Game_2.wav", label: "게임효과음2" },
  { file: "sfx_GunShot.wav", label: "총격음" },
  { file: "sfx_Jump.wav", label: "점프" },
  { file: "sfx_Laser.wav", label: "레이저" },
  { file: "sfx_POP.wav", label: "버블팝" },
  { file: "sfx_POP_2.wav", label: "버블팝2" },
  { file: "sfx_Reload.wav", label: "재장전" },
  { file: "sfx_Squeak.wav", label: "장난감소리" },
];

const DEFAULT_SOUND = "sfx_POP.wav";
const audioCacheRef = useRef({});
useEffect(() => {
  SOUND_LIST.forEach(({ file }) => {
    const audio = new Audio(`/${file}`);
    audio.preload = "auto";
    audioCacheRef.current[file] = audio;
  });
}, []);

const playSound = (file, volume = 1) => {
  if (!file) return;

  let audio = audioCacheRef.current[file];

  if (!audio) {
    audio = new Audio(`/${file}`);
    audio.preload = "auto";
    audioCacheRef.current[file] = audio;
  }

  audio.volume = volume;
  audio.currentTime = 0;

  audio.play().catch((err) => {
    console.warn("Sound play failed:", file, err);
  });
};

  /* ================= 화면 공유 ================= */
const startScreenShare = async () => {
  const media = await navigator.mediaDevices.getDisplayMedia({
    video: {
      displaySurface: "window"
    },
    audio: false
  });

  setStream(media);
};

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
  iconDetectLinkedRef.current = iconDetectLinked;
}, [iconDetectLinked]);

useEffect(() => {
  globalDetectionPausedRef.current = globalDetectionPaused;
}, [globalDetectionPaused]);

useEffect(() => {
  stopwatchRunningRef.current = stopwatchRunning;
}, [stopwatchRunning]);
/* ================= 자동 저장 ================= */

useEffect(() => {

  if (loadingRef.current) return;

  saveSettings();

}, [
  regions,
  repeatTimers,
  stopwatchTime,
  currentLapTime,
  laps,
  linkWithRepeat,
  lapDeleteLock,
  iconDetectLinked,
  regionOffsetHidden,
  regionOffsetVisible,
  isVideoHidden
]);
/* ================= 설정 불러오기 ================= */
useEffect(() => {
  const saved = localStorage.getItem("contactCooldown");

  if (saved) {
    setNextContactTime(Number(saved));
  }
}, []);

useEffect(() => {

  const saved = localStorage.getItem("maple_timer_settings");
    if (!saved) {
    loadingRef.current = false;
    
    return;
  }

  try {
    const data = JSON.parse(saved);

if (data.repeatTimers) {
setRepeatTimers(
  data.repeatTimers.map(t => ({
    ...t,
    id: Date.now() + Math.random(),
    timeLeft: t.duration,
    running: false,
    repeat: t.repeat ?? true
  }))
);
}

    if (data.stopwatchTime !== undefined) {
      setStopwatchTime(data.stopwatchTime);
    }

    if (data.currentLapTime !== undefined) {
      setCurrentLapTime(data.currentLapTime);
    }

    if (data.laps) {
      setLaps(data.laps);
    }

    if (data.linkWithRepeat !== undefined) {
      setLinkWithRepeat(data.linkWithRepeat);
    }

    if (data.lapDeleteLock !== undefined) {
      setLapDeleteLock(data.lapDeleteLock);
    }
if (data.iconDetectLinked !== undefined) {
  setIconDetectLinked(data.iconDetectLinked);
}
    if (data.regionOffsetHidden !== undefined) {
  setRegionOffsetHidden(data.regionOffsetHidden);
}
if (data.regionOffsetVisible !== undefined) {
  setRegionOffsetVisible(data.regionOffsetVisible);
}
    if (data.isVideoHidden !== undefined) {
  setIsVideoHidden(data.isVideoHidden);
}

    if (data.regions) {
      const restored = data.regions.map(r => {

        const previewRef = { current: document.createElement("canvas") };
        previewRef.current.width = 75;
        previewRef.current.height = 75;

        return {
          ...r,
          previewRef,
          timeLeft: 0,
          timerRunning: false,
          detectionEnabled: r.detectionEnabled ?? true,
          lastBottomFrame: null,
          lastTopFrame: null,
          pendingTrigger: false,
          pendingFrames: []
        };
      });

      setRegions(restored);
    }

  } catch (err) {
    console.warn("설정 불러오기 실패", err);
  }

  loadingRef.current = false;
}, []);
  /* ================= canvas 1회 초기화 ================= */
  useEffect(() => {
    if (!stream) return;

    const video = videoRef.current;
    const canvas = hiddenCanvasRef.current;

    const handleLoaded = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      hiddenCtxRef.current = canvas.getContext("2d");
    };

    video.addEventListener("loadedmetadata", handleLoaded);
    return () => video.removeEventListener("loadedmetadata", handleLoaded);
  }, [stream]);

  /* ================= contain 보정 ================= */
  const getVideoDisplayInfo = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;

    const rect = video.getBoundingClientRect();
    const videoRatio = video.videoWidth / video.videoHeight;
    const elementRatio = rect.width / rect.height;

    let displayWidth, displayHeight, offsetX = 0, offsetY = 0;

    if (videoRatio > elementRatio) {
      displayWidth = rect.width;
      displayHeight = rect.width / videoRatio;
      offsetY = (rect.height - displayHeight) / 2;
    } else {
      displayHeight = rect.height;
      displayWidth = rect.height * videoRatio;
      offsetX = (rect.width - displayWidth) / 2;
    }

    return { displayWidth, displayHeight, offsetX, offsetY };
  };

  const getRealSelection = (selection) => {
    if (!selection) return null;
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;

    const info = getVideoDisplayInfo();
    if (!info) return null;

    const scaleX = video.videoWidth / info.displayWidth;
    const scaleY = video.videoHeight / info.displayHeight;
    return {
      x: (selection.x - info.offsetX) * scaleX,
      y: (selection.y - info.offsetY) * scaleY,
      size: selection.size * scaleX,
    };
  };

  /* ================= 감지 루프 ================= */
  useEffect(() => {
    if (!stream) return;

const interval = setInterval(() => {

  const video = videoRef.current;
  const ctx = hiddenCtxRef.current;
  if (!video || !ctx) return;

      setRegions((prev) =>
        prev.map((region) => {

const detectionBlocked =
  !region.detectionEnabled ||
  (iconDetectLinkedRef.current
    ? !stopwatchRunningRef.current
    : globalDetectionPausedRef.current);

  const canTrigger =
    !region.timerRunning ||
    region.timeLeft <= region.restartDetectTime;

const real = {
  x: Math.floor(region.selection.xRatio * video.videoWidth),
  y: Math.floor(region.selection.yRatio * video.videoHeight),
  size: Math.floor(region.selection.sizeRatio * video.videoWidth)
};
          if (!real) return region;

          const halfHeight = Math.floor(real.size * 0.5);

          ctx.drawImage(
            video,
            real.x,
            real.y,
            real.size,
            real.size,
            0,
            0,
            real.size,
            real.size
          );

          const bottomFrame = ctx.getImageData(
            0,
            real.size - halfHeight,
            real.size,
            halfHeight
          );

          const topFrame = ctx.getImageData(
            0,
            0,
            real.size,
            halfHeight
          );

if (region.previewRef?.current) {
  const canvas = region.previewRef.current;
  const pctx = canvas.getContext("2d");

  const PREVIEW_SIZE = 75;

  pctx.clearRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);

  pctx.drawImage(
    video,
    real.x,
    real.y,
    real.size,
    real.size,
    0,
    0,
    PREVIEW_SIZE,
    PREVIEW_SIZE
  );
}
if (detectionBlocked) {
  return {
    ...region,
    lastBottomFrame: bottomFrame,
    lastTopFrame: topFrame,
  };
}
          if (!region.lastBottomFrame || !region.lastTopFrame) {
            return {
  ...region,
  lastBottomFrame: bottomFrame,
  lastTopFrame: topFrame,
};
          }

          let bottomDiff = 0;
          let topDiff = 0;

          for (let i = 0; i < bottomFrame.data.length; i += 16) {
            bottomDiff += Math.abs(bottomFrame.data[i] - region.lastBottomFrame.data[i]);
          }

          for (let i = 0; i < topFrame.data.length; i += 16) {
            topDiff += Math.abs(topFrame.data[i] - region.lastTopFrame.data[i]);
          }

          const bottomChanged = bottomDiff > pixelDiffThreshold * 2;
const topChanged = topDiff > pixelDiffThreshold * 2;
          if (!bottomChanged && !topChanged && !region.pendingTrigger) {
            return region;
          }

          if (bottomChanged && !topChanged && !region.pendingTrigger) {
            return {
              ...region,
              pendingTrigger: true,
              pendingFrames: [],
              lastBottomFrame: bottomFrame,
              lastTopFrame: topFrame,
            };
          }

          if (region.pendingTrigger) {
            const frames = [...(region.pendingFrames || []), bottomFrame];

            if (frames.length >= 2) {
              let diff = 0;
              for (let i = 0; i < frames[0].data.length; i += 16) {
                diff += Math.abs(frames[0].data[i] - frames[1].data[i]);
              }

              const framesSame = diff <= pixelDiffThreshold * 4;

              if (framesSame && canTrigger) {

if (region.playSoundOnStart) {
  playSound(region.sound, region.volume);
}
  return {
    ...region,
    timeLeft: region.timerDuration,
    timerRunning: true,
    pendingTrigger: false,
    pendingFrames: [],
    lastBottomFrame: bottomFrame,
    lastTopFrame: topFrame,
  };
} else {
                return {
                  ...region,
                  pendingTrigger: false,
                  pendingFrames: [],
                  sameFrameCount: 0,
                  lastBottomFrame: bottomFrame,
                  lastTopFrame: topFrame,
                };
              }
            }

            return {
              ...region,
              pendingFrames: frames,
              lastBottomFrame: bottomFrame,
              lastTopFrame: topFrame,
            };
          }

          return {
            ...region,
            lastBottomFrame: bottomFrame,
            lastTopFrame: topFrame,
          };
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, [stream]);

  /* ================= 타이머 ================= */
  useEffect(() => {
    const interval = setInterval(() => {
      setRegions((prev) =>
        prev.map((region) => {
          if (!region.timerRunning) return region;
          if (region.timeLeft <= 1) {
playSound(region.sound, region.volume);

  return { ...region, timerRunning: false, timeLeft: 0 };
}
          return { ...region, timeLeft: region.timeLeft - 1 };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  /* ================= 타이머 로직 ================= */
useEffect(() => {
  const interval = setInterval(() => {
    setRepeatTimers((prev) =>
      prev.map((timer) => {
        if (!timer.running) return timer;

        if (timer.timeLeft <= 1) {

  playSound(timer.sound, timer.volume);

  if (timer.repeat) {
    return {
      ...timer,
      timeLeft: timer.duration,
    };
  }

  return {
    ...timer,
    running: false,
    timeLeft: 0,
  };
}

        return {
          ...timer,
          timeLeft: timer.timeLeft - 1,
        };
      })
    );
  }, 1000);

  return () => clearInterval(interval);
}, []);
/* ================= 스톱워치 로직 ================= */
useEffect(() => {
  if (!stopwatchRunning) return;

  const interval = setInterval(() => {
    setStopwatchTime((prev) => prev + 1);
    setCurrentLapTime((prev) => prev + 1);
  }, 1000);

  return () => clearInterval(interval);
}, [stopwatchRunning]);

  const handleMouseDown = (e) => {
    if (!isSelecting) return;
    const rect = videoRef.current.getBoundingClientRect();
    setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  useEffect(() => {
  if (!dragStart) return;

  const handleMove = (e) => {
    const rect = videoRef.current.getBoundingClientRect();
let currentX = e.clientX - rect.left;
let currentY = e.clientY - rect.top;

currentX = Math.max(0, Math.min(currentX, rect.width));
currentY = Math.max(0, Math.min(currentY, rect.height));

    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;

    const size = Math.min(Math.abs(deltaX), Math.abs(deltaY));
    const newX = deltaX < 0 ? dragStart.x - size : dragStart.x;
    const newY = deltaY < 0 ? dragStart.y - size : dragStart.y;

    setCurrentSelection({ x: newX, y: newY, size });
  };

  const handleUp = () => {
    setDragStart(null);
  };

  window.addEventListener("mousemove", handleMove);
  window.addEventListener("mouseup", handleUp);

  return () => {
    window.removeEventListener("mousemove", handleMove);
    window.removeEventListener("mouseup", handleUp);
  };
}, [dragStart]);
useEffect(() => {
  if (!isSectionDragging) return;

  const handleMove = (e) => {
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const diffY = clientY - sectionDragStartYRef.current;
    const rawOffset = sectionDragStartOffsetRef.current + diffY;
    setRegionOffsetY(Math.max(0, rawOffset));
  };

  const handleUp = (e) => {
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    const diffY = clientY - sectionDragStartYRef.current;
    const rawOffset = sectionDragStartOffsetRef.current + diffY;
    setRegionOffsetY(Math.max(0, rawOffset));
    setIsSectionDragging(false);
  };

  window.addEventListener("mousemove", handleMove);
  window.addEventListener("mouseup", handleUp);
  return () => {
    window.removeEventListener("mousemove", handleMove);
    window.removeEventListener("mouseup", handleUp);
  };
}, [isSectionDragging]);
useEffect(() => {
  if (draggingCardId === null) return;

  const handleMove = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const diffX = clientX - dragStartXRef.current;
    setDraggingX(diffX);

    const steps = Math.round(diffX / CARD_WIDTH);
    const fromIndex = dragStartIndexRef.current;
    const toIndex = Math.max(0, Math.min(regions.length - 1, fromIndex + steps));
    setDraggingTargetIndex(toIndex);
  };

  const handleUp = (e) => {
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const diffX = clientX - dragStartXRef.current;
    const steps = Math.round(diffX / CARD_WIDTH);

    if (steps !== 0) {
      setRegions(prev => {
        const arr = [...prev];
        const fromIndex = dragStartIndexRef.current;
        const toIndex = Math.max(0, Math.min(arr.length - 1, fromIndex + steps));
        const [removed] = arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, removed);
        return arr;
      });
    }

    setDraggingCardId(null);
    setDraggingX(0);
    setDraggingTargetIndex(null);
  };

  window.addEventListener("mousemove", handleMove);
  window.addEventListener("mouseup", handleUp);
  return () => {
    window.removeEventListener("mousemove", handleMove);
    window.removeEventListener("mouseup", handleUp);
  };
}, [draggingCardId, regions.length]);
useEffect(() => {
  if (!isSelecting) {
    setPopover(null);
    return;
  }

  const updatePos = () => {
    const btn = saveButtonRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const flip = rect.top < 120;
setPopover({
      id: "save-hint",
      x: rect.left + rect.width / 2,
      y: rect.bottom,
      flip: true,
      content: (
        <>
          감지할 아이콘을 최대한 정확하게 드래그 후<br />
          <strong>"저장"</strong> 버튼을 눌러주세요.
        </>
      ),
    });
  };

  updatePos();

  window.addEventListener("scroll", updatePos, true);
  window.addEventListener("resize", updatePos);

  return () => {
    window.removeEventListener("scroll", updatePos, true);
    window.removeEventListener("resize", updatePos);
  };
}, [isSelecting]);
const toggleDetection = () => {

  setGlobalDetectionPaused(prev => !prev);

};

const createNew = (event) => {

  if (regions.length >= 8) {

    showPopover(
      event,
      "아이콘 감지는 최대 8개까지 생성할 수 있습니다."
    );

    return;
  }

  setIsVideoHidden(false);
  setIsSelecting(true);
  setCurrentSelection(null);
};

    const cancelSelection = () => {
  setIsSelecting(false);
  setCurrentSelection(null);
  setDragStart(null);

  if (replaceTargetId !== null) {
    setReplaceTargetId(null);
  }
};
  

  const saveRegion = () => {
    if (replaceTargetId !== null) {
      if (!currentSelection) return;

      setRegions((prev) =>
        prev.map((region) =>
region.id === replaceTargetId
  ? {
      ...region,
      selection: (() => {
  const real = getRealSelection(currentSelection);
  const video = videoRef.current;

  return {
    xRatio: real.x / video.videoWidth,
    yRatio: real.y / video.videoHeight,
    sizeRatio: real.size / video.videoWidth
  };
})(),
      lastBottomFrame: null,
      lastTopFrame: null,
      pendingTrigger: false,
      pendingFrames: [],
    }
  : region
        )
      );

      setReplaceTargetId(null);
      setIsSelecting(false);
      setCurrentSelection(null);
      return; 
    }
    if (!currentSelection) return;
    const previewRef = { current: document.createElement("canvas") };
    previewRef.current.width = 75;
previewRef.current.height = 75;
    const newRegion = {
      id: Date.now(),
      selection: (() => {
  const real = getRealSelection(currentSelection);
  const video = videoRef.current;

  return {
    xRatio: real.x / video.videoWidth,
    yRatio: real.y / video.videoHeight,
    sizeRatio: real.size / video.videoWidth
  };
})(),
      timerDuration: 300,
      timeLeft: 0,
      timerRunning: false,
      lastBottomFrame: null,
      lastTopFrame: null,
      detectionEnabled: true,
      pendingTrigger: false,
      pendingFrames: [],
      previewRef,
      sound: DEFAULT_SOUND,
      volume: 0.5, 
      restartDetectTime: 20,
      playSoundOnStart: true,
    };
    setRegions((prev) => [...prev, newRegion]);
    setIsSelecting(false);
    setCurrentSelection(null);
  };

  const deleteRegion = (id) => {
    setRegions((prev) => prev.filter((r) => r.id !== id));
  };

 const toggleRegionDetection = (id) => {

  setRegions(prev =>
    prev.map(r => {

      if (r.id !== id) return r;

      const nextState = !r.detectionEnabled;

      if (!nextState) {
        return {
          ...r,
          detectionEnabled:false,
          timeLeft:0,
          timerRunning:false
        };
      }

      return {
        ...r,
        detectionEnabled:true,

        lastBottomFrame:null,
        lastTopFrame:null,
        pendingTrigger:false,
        pendingFrames:[]
      };

    })
  );

};

const resetTimer = (id) => {
  setRegions((prev) =>
    prev.map((r) =>
      r.id === id ? { ...r, timeLeft: 0, timerRunning: false } : r
    )
  );
};
/* ================= 타이머 함수 ================= */

const addRepeatTimer = (event) => {

  if (repeatTimers.length >= 30) {
    showPopover(event, "타이머는 최대 30개까지 생성할 수 있습니다.");
    return;
  }

  setRepeatTimers((prev) => [
    ...prev,
    {
      id: Date.now(),
      duration: 100,
      timeLeft: 100,
      running: false,
      sound: DEFAULT_SOUND,
      volume: 0.5,

      repeat: false,
    },
  ]);

};

const startRepeatTimer = (id) => {
  setRepeatTimers((prev) =>
    prev.map((t) =>
      t.id === id
        ? { ...t, running: true, timeLeft: t.duration }
        : t
    )
  );
};

const resetRepeatTimer = (id) => {
  setRepeatTimers((prev) =>
    prev.map((t) =>
      t.id === id
        ? { ...t, running: false, timeLeft: t.duration }
        : t
    )
  );
};

const startAllRepeatTimers = () => {
  setRepeatTimers((prev) =>
    prev.map((t) => ({
      ...t,
      running: true,
      timeLeft: t.duration,
    }))
  );

  if (linkWithRepeat) {
    setStopwatchRunning(true);
  }
};

const resetAllRepeatTimers = () => {
  setRepeatTimers((prev) =>
    prev.map((t) => ({
      ...t,
      running: false,
      timeLeft: t.duration,
    }))
  );

  if (linkWithRepeat) {
    setStopwatchRunning(false);
  }
};
/* ================= 스톱워치 함수 ================= */

const formatTime = (time) => {
  const hours = String(Math.floor(time / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((time % 3600) / 60)).padStart(2, "0");
  const seconds = String(time % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const handleStopwatchStart = () => {
  setStopwatchRunning(true);
  if (linkWithRepeat) startAllRepeatTimers();
};

const handleStopwatchPause = () => {
  setStopwatchRunning(false);
  if (linkWithRepeat) resetAllRepeatTimers();
};
const handleStopwatchToggle = () => {
  if (stopwatchRunning) {
    handleStopwatchPause();
  } else {
    handleStopwatchStart();
  }
};

const handleStopwatchReset = (event) => {

  showPopover(
    event,
    <>
      스톱워치의 모든 데이터가 초기화됩니다.
      <br/><br/>
      계속하시겠습니까?

      <div style={{marginTop:8, display:"flex", gap:6}}>
        <button onClick={()=>{

          setStopwatchTime(0);
          setStopwatchRunning(false);
          setLaps([]);
          setCurrentLapTime(0);

          if (linkWithRepeat) {
            resetAllRepeatTimers();
          }

          setPopover(null);

        }}>
          확인
        </button>

        <button onClick={()=>setPopover(null)}>
          취소
        </button>
      </div>
    </>,
    { autoClose:false }
  );

};

const handleAddLap = (event) => {
  if (laps.length >= 30) {

  showPopover(
    event,
    "랩은 최대 30개까지 기록됩니다."
  );
  return;
}

  setLaps((prev) => [...prev, { time: currentLapTime, memo: "" }]);
  setCurrentLapTime(0);
};
const openMemoModal = (event, index) => {

  const currentMemo = laps[index].memo || "";

  showPopover(
    event,
    <MemoEditor
      index={index}
      initialText={currentMemo}
      onSave={(text) => {
        setLaps(prev =>
          prev.map((lap, i) =>
            i === index ? { ...lap, memo: text } : lap
          )
        );
      }}
      onClose={() => setPopover(null)}
    />,
    { autoClose: false }
  );
};
const removeLap = (index) => {
  setLaps((prev) => prev.filter((_, i) => i !== index));
};

  return (
<div
  style={{
    background: "#111",
    color: "white",
    minHeight: "100vh",
    padding: 20,
    paddingBottom: 900,
    fontFamily: "Maplestory"
  }}
>
<style>{`
  .region-card-active {
    box-shadow: 0 0 0 2px orange, 0 0 14px rgba(255, 165, 0, 0.35);
    background: #1a1a1a !important;
  }
  .region-card-inactive {
    box-shadow: 0 2px 10px rgba(0,0,0,0.5);
    background: #1a1a1a !important;
  }
  .timer-digit {
    font-family: 'Orbitron', 'Courier New', monospace;
    font-variant-numeric: tabular-nums;
    letter-spacing: 2px;
  }
  .header-divider {
    border: none;
    border-top: 1px solid rgba(255,255,255,0.08);
    margin: 0 0 15px 0;
  }
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600&display=swap');
`}</style>
{/* ===== Header ===== */}
<div
  style={{
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    height: 80,
    marginBottom: 20
  }}
>

  {/* 로고 */}
<img
    src="/mallang_logo.png"
    style={{
      position: "absolute",
      left: -55,
      top: -70,
      height: 240,
      objectFit: "contain",
      pointerEvents: "none"
    }}
  />

  {/* 기존 버튼 영역 */}
  <div
    style={{
      display: "flex",
      gap: 8
    }}
  >

<button
onClick={(e) => {
  showPopover(
    e,
    <>
      해당 사이트는 제작자가 메이플랜드 도핑 사용과 아이템 회수를 너무 자주 까먹어서 만들게 된 사이트입니다.
      <br /><br />
      퀵슬롯에 있는 소모품(사이다, 전비, 경쿠 등)의 사용을 자동으로 감지하여 타이머가 작동하는 기능과,<br />
      사냥에 유용한 스톱워치, 타이머 기능이 있습니다!
      <br /><br />
      추후 지속적으로 기능이 추가될 예정이니 기대해주세요!
      <br /><br />
      버그 제보/문의사항 등은 우측 하단에 있는 버튼을 통해 보내주시면,<br />
      (정말 사소한 것도 괜찮아요!) 개선하겠습니다!
    </>,
    { autoClose: false }
  );
}}
>
사이트 소개
</button>

<button
onClick={(e) => {
  showPopover(
    e,
    <>
      - 자동 감지 타이머 사용법
      <br /><br />
      1. [게임 화면 공유하기] 를 눌러 메이플랜드 창을 선택해주세요.<br />
      2. [새로 만들기] 버튼을 누른 후 감지하고자 하는 소모품(도핑)이 위치한 퀵슬롯 부분을 최대한 정확하게 드래그 해주세요.<br />
      3. [저장] 버튼을 눌러주세요.<br />
      4. 하단에 생성된 카드에서 타이머의 시간과 알림음, 음량 등을 설정해주세요.<br />
      5. 이후 게임에서 해당 소모품을 사용하면 자동으로 감지하여 타이머가 작동됩니다!
      <br /><br />
      우측 패널에 있는 스톱워치와 타이머의 경우 이름 옆 툴팁을 통해 확인해주세요!
    </>,
    { autoClose: false }
  );
}}
>
기본 사용법
</button>
<button
ref={presetButtonRef}
onClick={(e)=>{

showPopover(
e,

<div style={{display:"flex",flexDirection:"column",gap:6}}>
<button onClick={() => { setPopover(null); setPresetModal("save"); }}>
  프리셋 저장
</button>

<button onClick={() => { setPopover(null); setPresetModal("delete"); }}>
  프리셋 삭제
</button>

<button onClick={() => { setPopover(null); setPresetModal("load"); }}>
  프리셋 불러오기
</button>
<button onClick={(e) => { setPopover(null); exportPresets(e); }}>
  파일 내보내기
</button>

<label style={{ cursor: "pointer" }}>
  <input
    type="file"
    accept=".json"
    style={{ display: "none" }}
    onChange={(e) => {
      setPopover(null);
      importPresets(e.target.files[0]);
      e.target.value = "";
    }}
  />
  <span
    style={{
      display: "block",
      padding: "0.5em 1.1em",
      borderRadius: 8,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "linear-gradient(180deg, #2a2a2a 0%, #1e1e1e 100%)",
      color: "rgba(255,255,255,0.87)",
      cursor: "pointer",
      fontSize: "1em",
      fontFamily: "inherit",
      fontWeight: 500,
      textAlign: "center",
      boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
    }}
  >
    파일 가져오기
  </span>
</label>
<button onClick={(e)=>resetToInitialSettings(e)}>
초기 프리셋
</button>

</div>,

{autoClose:false}

);

}}
>
프리셋 관리
</button>
  </div>

</div>
<hr className="header-divider" />
{/* ===== 공지사항 바 ===== */}
{latestNotice && (
  <div
    onClick={openNoticeModal}
    style={{
      width: "98.5%",
      height: 36,
      background: "#1a1a1a",
      border: "1px solid #444",
      borderRadius: 6,
      display: "flex",
      alignItems: "center",
      padding: "0 12px",
      marginBottom: 15,
      cursor: "pointer",
      transition: "all 0.2s"
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "#2a2a2a";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "#1a1a1a";
    }}
  >
    <span style={{ color: "#ffa500", marginRight: 8 }}>
      📢 공지사항 :
    </span>

<span
      style={{
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }}
    >
      {latestNotice.preview || latestNotice.title}
    </span>
  </div>
)}
<div style={{ textAlign: "center", marginBottom: 20, display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
  <button onClick={() => setIsVideoHidden(prev => !prev)} disabled={!stream}>
    {isVideoHidden ? "화면 보이기" : "화면 숨기기"}
  </button>
  <button onClick={startScreenShare}>게임 화면 공유하기</button>
  <Tooltip text="아이콘 감지를 위해 게임 화면을 공유하는 기능입니다.

*화면 영상은 서버로 전송되지 않습니다.
*모든 감지는 브라우저 내부에서 처리됩니다." />
</div>
{isSelecting && (
  <div
    style={{
      position: "fixed",
      top: 0, left: 0,
      width: "100%", height: "100%",
      background: "rgba(0,0,0,0.6)",
      zIndex: 50,
      pointerEvents: "none",
    }}
  />
)}
<div style={{ display: "flex", justifyContent: "center", gap: 30, position:"relative" }}>
<div
  style={{
    position: "relative",
    maxHeight: "180vh",
    overflowY: "auto",
    zIndex: isSelecting ? 51 : "auto",
  }}
>

<video
    ref={videoRef}
    autoPlay
    playsInline
    style={{
      width: "80vw",
      maxHeight: "85vh",
      cursor: isSelecting ? "crosshair" : "default",
      objectFit: "contain",
      visibility: (!stream || isVideoHidden) ? "hidden" : "visible",
      height: (!stream || isVideoHidden) ? 0 : undefined,
      marginBottom: (!stream || isVideoHidden) ? 0 : undefined,
      border: (!stream || isVideoHidden) ? "none" : "2px solid white",
    }}
    onMouseDown={handleMouseDown}
  />

  {isDetectionPaused && !isVideoHidden && (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 20
      }}
    >
      <div
        style={{
          fontSize: 54,
          fontWeight: "bold",
          color: "gray",
          textShadow: "0 0 10px black"
        }}
      >
        감지 일시중지
      </div>
    </div>
  )}
          {/* ================= 고정 타이머 패널 ================= */}
<div
  style={{
position: "fixed",
left: "calc(80vw + 65px)",
top: 20,
width: 260,
display: "flex",
flexDirection: "column",
gap: 14,
height: "96vh",
overflowY: "auto",
}}
>
{/* ================= 스톱워치 ================= */}
<div
  style={{
    border: stopwatchRunning ? "2px solid #666" : "2px solid #333",
    borderRadius: 8,
    padding: 15,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    minHeight: 470,
    background: "#1a1a1a",
    boxShadow: stopwatchRunning
      ? "0 0 10px rgba(255,165,0,0.12)"
      : "none",
    transition: "box-shadow 0.3s, border-color 0.3s",
  }}
>
<div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:6 }}>
  <h3 style={{ margin:0 }}>스톱워치</h3>
  <Tooltip text="사냥 시간을 타임(랩)별로 나눠서 기록하고,
타임(랩)별 간단한 메모 기능을 제공하는 스톱워치입니다.

다른 기능과 연동하여 사용할 수 있습니다." />
</div>

<div className="timer-digit" style={{ fontSize: 22, textAlign: "center" }}>
  {formatTime(stopwatchTime)}
</div>

<div style={{ textAlign: "center", marginTop: 4 }}>
  <div style={{ fontSize: 16, color: "#00ffcc", marginBottom: 2 }}>현재 랩</div>
  <div className="timer-digit" style={{ fontSize: 18, color: "#00ffcc" }}>
    {formatTime(currentLapTime)}
  </div>
</div>

  <label style={{ fontSize: 14 }}>
  <input
    type="checkbox"
    checked={linkWithRepeat}
    onChange={(e) => setLinkWithRepeat(e.target.checked)}
    style={{ marginRight: 5 }}
  />
  타이머와 연동

<Tooltip
text={`스톱워치의 재생, 정지가 타이머와 연동되는 기능입니다.

스톱워치 재생 <-> 타이머 전체시작
스톱워치 정지 <-> 타이머 전체 정지
스톱워치 초기화 -> 타이머 전체 정지(단방향)`}
 />
</label>
<label style={{ fontSize: 14 }}>
  <input
    type="checkbox"
    checked={iconDetectLinked}
    onChange={(e) => {
  const checked = e.target.checked;

  setIconDetectLinked(checked);

  if (checked) {
    setGlobalDetectionPaused(false);
  } else {
    setGlobalDetectionPaused(false);
  }
}}
    style={{ marginRight: 5 }}
  />
  아이콘 감지와 연동

<Tooltip
text={`스톱워치가 작동 중일 때만 아이콘 감지가 활성화됩니다.
사냥중이 아닐 때 오작동을 방지할 수 있는 기능입니다.`}
/>

</label>
  <label style={{ fontSize: 14 }}>
    <input
      type="checkbox"
      checked={lapDeleteLock}
      onChange={(e) => setLapDeleteLock(e.target.checked)}
      style={{ marginRight: 5 }}
    />
    🔒 랩 삭제 보호
  </label>

  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 5,
    }}
  >
<button
style={{
width: 80,
height: 36,
fontSize: 15,
fontWeight: "bold",
display: "flex",
alignItems: "center",
justifyContent: "center",
whiteSpace: "nowrap"
}}
      onClick={handleAddLap}
    >
      랩
    </button>
    <button
      
style={{
width: 80,
height: 36,
fontSize: 15,
fontWeight: "bold",
display: "flex",
alignItems: "center",
justifyContent: "center",
whiteSpace: "nowrap"
}}
      onClick={handleStopwatchToggle}
    >
      {stopwatchRunning ? "⏸" : "▶"}
    </button>

    <button
      style={{
width: 80,
height: 36,
fontSize: 15,
fontWeight: "bold",
display: "flex",
alignItems: "center",
justifyContent: "center",
whiteSpace: "nowrap",
flexShrink: 0
      }}
      onClick={(e)=>handleStopwatchReset(e)}
    >
      초기화
    </button>
  </div>

  <div
    style={{
      maxHeight: 230,
      overflowY: "auto",
      borderTop: "1px solid gray",
      paddingTop: 8,
    }}
  >
{laps.map((lap, index) => (
      <div key={index} style={{
        background: "#1a1a1a",
        border: "1px solid #444",
        borderRadius: 6,
        padding: "6px 8px",
        marginBottom: 6,
        boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
      }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <span>
            {index + 1}. {formatTime(lap.time)}
          </span>

          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={(e) => openMemoModal(e, index)}>📄</button>

            <button
              disabled={lapDeleteLock}
              style={{ opacity: lapDeleteLock ? 0.3 : 1 }}
              onClick={() => removeLap(index)}
            >
              -
            </button>
          </div>
        </div>

{lap.memo && (
  <div
    style={{
      fontSize: 12,
      color: "#ccc",
      marginBottom: 2,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      cursor: "pointer",
      textDecoration: hoverMemoIndex === index ? "underline" : "none"
    }}
    onMouseEnter={() => setHoverMemoIndex(index)}
    onMouseLeave={() => setHoverMemoIndex(null)}
    title="메모 전체 보기"
    onClick={(e) => openMemoModal(e, index)}
  >
    {lap.memo.split("\n")[0]}
    {lap.memo.includes("\n") ? " ..." : ""}
  </div>
)}
      </div>
    ))}
  </div>
</div>

<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: 12,
    maxHeight: "54vh",
    minHeight: "54vh",
    overflowY: "auto",
    border: repeatTimers.some(t => t.running) ? "2px solid #666" : "2px solid #333",
    borderRadius: 8,
    padding: 12,
    background: "#1a1a1a",
    boxShadow: repeatTimers.some(t => t.running)
      ? "0 0 10px rgba(255,165,0,0.12)"
      : "none",
    transition: "box-shadow 0.3s, border-color 0.3s",
  }}
>

<div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:6 }}>
  <h3 style={{ margin:0 }}>타이머</h3>
  <Tooltip text="간단한 타이머 기능입니다.
반복 체크 시, 유저가 직접 초기화하기 전까지 타이머가 반복됩니다.
일정 시간마다 버프 갱신 또는 아이템 회수를 할 때 유용합니다." />
</div>

<div
style={{
display:"flex",
flexDirection:"column",
gap:6,
alignItems:"center"
}}
>

<button
style={{
width:"100%",
height:38
}}
onClick={(e) => addRepeatTimer(e)}
>
+ 타이머 추가
</button>

<button
style={{
width:"100%",
height:38
}}
onClick={startAllRepeatTimers}
>
전체 시작
</button>

<button
style={{
width:"100%",
height:38
}}
onClick={resetAllRepeatTimers}
>
전체 정지
</button>

</div>

{repeatTimers.map((timer) => (

<div
    key={timer.id}
    style={{
      border: timer.running ? "1px solid orange" : "1px solid #444",
      borderRadius: 8,
      padding: 8,
      display: "flex",
      flexDirection: "column",
      gap: 6,
      background: "#1a1a1a",
      boxShadow: timer.running
        ? "0 0 10px rgba(255,165,0,0.25)"
        : "0 2px 6px rgba(0,0,0,0.4)",
      transition: "box-shadow 0.3s, border-color 0.3s",
    }}
  >

<div className="timer-digit" style={{ textAlign: "center", fontSize: 16 }}>
  {String(Math.floor(timer.timeLeft / 60)).padStart(2,"0")}:{String(timer.timeLeft % 60).padStart(2,"0")}
</div>

<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "nowrap" 
  }}
>
  <input
    type="text"
    inputMode="numeric"
    value={Math.floor(timer.duration / 60)}
    onFocus={(e) => e.target.select()}
    onChange={(e) => {
      const minutes = e.target.value === "" ? 0 : Number(e.target.value);

      setRepeatTimers((prev) =>
        prev.map((t) =>
          t.id === timer.id
            ? {
                ...t,
                duration: minutes * 60 + (t.duration % 60),
                timeLeft: minutes * 60 + (t.duration % 60),
              }
            : t
        )
      );
    }}
    style={{ width: 40 }}
  />
  분

  <input
    type="text"
    inputMode="numeric"
    value={timer.duration % 60}
    onFocus={(e) => e.target.select()}
    onChange={(e) => {
      const seconds = e.target.value === "" ? 0 : Number(e.target.value);

      setRepeatTimers((prev) =>
        prev.map((t) =>
          t.id === timer.id
            ? {
                ...t,
                duration: Math.floor(t.duration / 60) * 60 + seconds,
                timeLeft: Math.floor(t.duration / 60) * 60 + seconds,
              }
            : t
        )
      );
    }}
    style={{ width: 40, marginLeft: 5 }}
  />
  초

  <label style={{ marginLeft: 8, whiteSpace: "nowrap" }}>
    <input
      type="checkbox"
      checked={timer.repeat}
      onChange={(e) =>
        setRepeatTimers((prev) =>
          prev.map((t) =>
            t.id === timer.id
              ? { ...t, repeat: e.target.checked }
              : t
          )
        )
      }
      style={{ marginRight: 4 }}
    />
    반복
  </label>
</div>

{/* 사운드 선택 */}
<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 6,
  }}
>
  <span style={{ minWidth: 40 }}>알림음 :</span>

  <select
    value={timer.sound}
    onChange={(e) =>
      setRepeatTimers((prev) =>
        prev.map((t) =>
          t.id === timer.id
            ? { ...t, sound: e.target.value }
            : t
        )
      )
    }
  >
    {SOUND_LIST.map((s) => (
      <option key={s.file} value={s.file}>
        {s.label}
      </option>
    ))}
  </select>
</div>

{/* 볼륨 */}
<div>

<div
style={{
display: "flex",
alignItems: "center",
gap: 6,
width: "100%"
}}
>

<input
type="range"
min="0"
max="1"
step="0.01"
value={timer.volume}
onChange={(e) =>
setRepeatTimers((prev) =>
prev.map((t) =>
t.id === timer.id
? { ...t, volume: Number(e.target.value) }
: t
)
)
}
style={{ flex: 1 }}
/>

<button
style={{
width: 32,
height: 26,
padding: 0,
flexShrink: 0
}}
onClick={() => playSound(timer.sound, timer.volume)}
>
🔊
</button>

</div>

<div style={{ marginTop: 2 }}>
음량 {Math.round(timer.volume * 100)}%
</div>

</div>

{/* 버튼 */}
<div
style={{
display: "flex",
alignItems: "center",
position: "relative",
height: 40,
}}
>
  <button
  style={{
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    height: 40,
    width: 64,
    fontSize: 18,
    whiteSpace: "nowrap",
    flexShrink: 0
  }}
  onClick={() => timer.running ? resetRepeatTimer(timer.id) : startRepeatTimer(timer.id)}
  >
  {timer.running ? "⏹" : "▶"}
  </button>

  <button
  style={{
    position: "absolute",
    right: 0,
    height: 34,
    padding: "0 12px",
    fontSize: 15,
    whiteSpace: "nowrap",
    flexShrink: 0
  }}
  onClick={() =>
  setRepeatTimers((prev) =>
  prev.filter((t) => t.id !== timer.id)
  )
  }
  >
  삭제
  </button>
</div>
  </div>

))}

</div>

</div>
</div>
{currentSelection && (
            <div
              style={{
                position: "absolute",
                left: currentSelection.x,
                top: currentSelection.y,
                width: currentSelection.size,
                height: currentSelection.size,
                border: "2px solid orange",
                zIndex: 60,
                pointerEvents: "none",
              }}
            />
          )}
              </div>
          

<div
  style={{
    textAlign: "center",
    marginTop: 15,
    display: "flex",
    justifyContent: "center",
    gap: 10,
    position: "relative",
    zIndex: isSelecting ? 51 : "auto",
  }}
>
  <button
  onClick={() => {
    setRegions(prev =>
      prev.map(r => ({
        ...r,
        timeLeft: 0,
        timerRunning: false
      }))
    );
  }}
>
  전체 타이머 초기화
</button>
  <button
  onClick={toggleDetection}
  
  disabled={iconDetectLinked}
>
{iconDetectLinked
  ? "연동중"
  : globalDetectionPaused
  ? "전체 감지 켜기"
  : "전체 감지 끄기"}
</button>

<button onClick={(e)=>createNew(e)} disabled={isSelecting}>
  새로 만들기
</button>

<button
    ref={saveButtonRef}
    onClick={saveRegion}
    disabled={!isSelecting}
  >
    저장
  </button>

  <button
    onClick={cancelSelection}
    disabled={!isSelecting}
  >
    취소
  </button>
</div>

{regions.length > 0 && (
<div
  style={{
    position: "relative",
    border: isDetectionPaused ? "1px solid #333" : "1px solid #666",
    borderRadius: 8,
    padding: "10px 10px 20px 10px",
    marginTop: 30 + regionOffsetY,
    transition: "box-shadow 0.3s, border-color 0.3s",
    boxShadow: isDetectionPaused
      ? "none"
      : "0 0 10px rgba(255, 165, 0, 0.12)",
  }}
>
  <div
    onMouseDown={(e) => {
      e.preventDefault();
      sectionDragStartYRef.current = e.clientY;
      sectionDragStartOffsetRef.current = regionOffsetY;
      setIsSectionDragging(true);
    }}
    style={{
      position: "absolute",
      top: 8,
      right: 10,
      display: "flex",
      flexDirection: "column",
      gap: 3,
      padding: "6px",
      cursor: isSectionDragging ? "grabbing" : "grab",
      zIndex: 10,
      userSelect: "none"
    }}
  >
    {[0,1,2].map(i => (
      <div key={i} style={{ width: 22, height: 2, background: "#aaa", borderRadius: 2 }} />
    ))}
  </div>

  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "flex-start",
      alignItems: "flex-start",
      gap: 20,
      marginTop: 10,
    }}
  >
        {regions.map((region,index) => (
<div
            key={region.id}
style={(() => {
              const fromIndex = dragStartIndexRef.current;
              const isDragging = draggingCardId === region.id;

              let nudge = 0;
              if (draggingCardId !== null && !isDragging && draggingTargetIndex !== null) {
                if (fromIndex < draggingTargetIndex) {
                
                  if (index > fromIndex && index <= draggingTargetIndex) {
                    nudge = -CARD_WIDTH;
                  }
                } else if (fromIndex > draggingTargetIndex) {
                  
                  if (index >= draggingTargetIndex && index < fromIndex) {
                    nudge = CARD_WIDTH;
                  }
                }
              }

return {
                border: (!isDetectionPaused && region.detectionEnabled)
                  ? "2px solid orange"
                  : "2px solid #444",
                padding: 15,
                width: 205,
                minHeight: 420,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                position: "relative",
                borderRadius: 10,
                opacity: isDragging ? 0.85 : 1,
                transform: isDragging
                  ? `translateX(${draggingX}px)`
                  : nudge !== 0
                  ? `translateX(${nudge}px)`
                  : "none",
                background: isDragging ? "rgba(0,0,0,0.7)" : "#1a1a1a",
                zIndex: isDragging ? 100 : 1,
                transition: isDragging ? "none" : "transform 0.15s, box-shadow 0.3s",
                cursor: isDragging ? "grabbing" : "default",
                boxShadow: (!isDetectionPaused && region.detectionEnabled)
                  ? "0 0 14px rgba(255,165,0,0.35)"
                  : "0 2px 10px rgba(0,0,0,0.5)",
              };
            })()}
          >
<div
style={{
display:"flex",
flexDirection:"column",
gap:6,
width:"100%",
alignItems:"center",
position:"relative"
}}
>
  {/* 카드 드래그 핸들 - 우측 상단 */}
  <div
    onMouseDown={(e) => {
      e.preventDefault();
      dragStartXRef.current = e.clientX;
      dragStartIndexRef.current = index;
      setDraggingCardId(region.id);
    }}
    style={{
      position: "absolute",
      top: 0,
      right: 0,
      display: "flex",
      flexDirection: "column",
      gap: 3,
      padding: "4px",
      cursor: "grab",
      userSelect: "none"
    }}
  >
    {[0,1,2].map(i => (
      <div key={i} style={{ width: 18, height: 2, background: "#aaa", borderRadius: 2 }} />
    ))}
  </div>

{/* 스위치 + 삭제/재지정 */}
<div
style={{
display:"flex",
gap:6,
alignItems:"center",
justifyContent:"center"
}}
>
<div
onClick={()=>{
  if(iconDetectLinked && !stopwatchRunning) return;
  if(globalDetectionPaused) return;
  toggleRegionDetection(region.id);
}}
style={{
width:42,
height:22,
background:region.detectionEnabled ? "#4caf50" : "#555",
borderRadius:20,
position:"relative",
cursor:(iconDetectLinked && !stopwatchRunning) ? "not-allowed":"pointer",
opacity:(iconDetectLinked && !stopwatchRunning) || globalDetectionPaused ? 0.5 : 1,
transition:"background 0.2s"
}}
>
<div
style={{
width:18,
height:18,
background:"white",
borderRadius:"50%",
position:"absolute",
top:2,
left:region.detectionEnabled ? 22 : 2,
transition:"left 0.2s"
}}
/>
</div>
</div>

<div
style={{
display:"flex",
gap:6,
justifyContent:"center"
}}
>
<button
onClick={() => deleteRegion(region.id)}
style={{
height:34,
padding:"0 12px",
fontSize:15
}}
>
삭제
</button>

<button
onClick={()=>{
setIsVideoHidden(false);
setReplaceTargetId(region.id);
setIsSelecting(true);
setCurrentSelection(null);
}}
disabled={isSelecting}
style={{
height:34,
padding:"0 12px",
fontSize:15
}}
>
재지정
</button>
</div>

</div>

            <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginLeft: 25
  }}
>
  <canvas
    ref={region.previewRef}
    width={75}
    height={75}
    style={{
      border: (isDetectionPaused || !region.detectionEnabled)
        ? "1px solid gray"
        : "1px solid white",
      filter: (isDetectionPaused || !region.detectionEnabled)
        ? "brightness(0.4)"
        : "none"
    }}
  />

  <Tooltip text="게임 화면 비율이 크게 바뀔 경우, 아이콘 위치가 틀어질 수 있습니다.

이 경우, 채널이동을 통해 화면을 기본 비율로 되돌리는 것을 권장합니다.

틀어진 상태로 재지정 시, 추후 재접속 후 재차 어긋날 수 있으므로 권장하지 않습니다.

*채널이동 시 화면이 기본 비율로 변경되기에, 틀어진 아이콘의 위치도 다시 정확해집니다." />
</div>           
<div className="timer-digit" style={{ fontSize: 18 }}>
    {String(Math.floor(region.timeLeft / 60)).padStart(2,"0")}:{String(region.timeLeft % 60).padStart(2,"0")}
  </div>

            {/* 🔥 타이머 설정 유지 */}
            <select
  defaultValue=""
  onChange={(e) => {
    const minutes = Number(e.target.value);
    setRegions((prev) =>
      prev.map((r) =>
        r.id === region.id
          ? { ...r, timerDuration: minutes * 60 }
          : r
      )
    );
  }}
  style={{ marginBottom: 5 }}
>
  <option value="" disabled>
    시간 프리셋 선택
  </option>
  <option value="5">5분</option>
  <option value="8">8분</option>
  <option value="10">10분</option>
  <option value="15">15분</option>
  <option value="20">20분</option>
<option value="30">30분</option>
<option value="60">60분</option>
</select>
            <div>
              <input
  type="text"
  inputMode="numeric"
  value={Math.floor(region.timerDuration / 60)}
  onFocus={(e) => e.target.select()}
  onChange={(e) => {
    const minutes = e.target.value === "" ? 0 : Number(e.target.value);
    setRegions((prev) =>
      prev.map((r) =>
        r.id === region.id
          ? { ...r, timerDuration: minutes * 60 + (r.timerDuration % 60) }
          : r
      )
    );
  }}
  style={{ width: 40 }}
/> 분
              <input
  type="text"
  inputMode="numeric"
  value={region.timerDuration % 60}
  onFocus={(e) => e.target.select()}
  onChange={(e) => {
    const seconds = e.target.value === "" ? 0 : Number(e.target.value);
    setRegions((prev) =>
      prev.map((r) =>
        r.id === region.id
          ? {
              ...r,
              timerDuration:
                Math.floor(r.timerDuration / 60) * 60 + seconds,
            }
          : r
      )
    );
  }}
  style={{ width: 40, marginLeft: 5 }}
/> 초
  <Tooltip
    text={`아이콘 하단의 숫자 변화가 감지되면
입력한 시간만큼 자동으로 타이머가 작동됩니다.`}
  />
            </div>

<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 6,
  }}
>
  <span
    style={{
      minWidth: 55,
      whiteSpace: "nowrap",
      fontSize: 15,
    }}
  >
   알림음 :
  </span>

<select
    style={{
      flex: 1,
      height: 32,
    }}
    value={region.sound}
    onChange={(e) =>
      setRegions((prev) =>
        prev.map((r) =>
          r.id === region.id
            ? {
                ...r,
                sound: e.target.value,
              }
            : r
        )
      )
    }
  >
    {SOUND_LIST.map((s) => (
      <option key={s.file} value={s.file}>
        {s.label}
      </option>
    ))}
  </select>
</div>
            <div>
              <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 6,
    width: "100%",
  }}
>
  <input
  type="range"
  min="0"
  max="1"
  step="0.01"
  value={region.volume}
  onChange={(e) =>
    setRegions((prev) =>
      prev.map((r) =>
        r.id === region.id
          ? { ...r, volume: Number(e.target.value) }
          : r
      )
    )
  }
  style={{ flex: 1 }}
/>

<button
  style={{
    width: 32,
    height: 26,
    padding: 0,
    flexShrink: 0,
  }}
onClick={() => {
  playSound(region.sound, region.volume);
}}
>
  🔊
</button>
</div>

<div style={{ marginTop: 2 }}>
  음량 {Math.round(region.volume * 100)}%
</div>
              <div style={{ marginTop: 5 }}>
  <div style={{ marginTop: 8 }}>
  <label style={{ cursor: "pointer" }}>
    <input
      type="checkbox"
      checked={region.playSoundOnStart}
      onChange={(e) =>
        setRegions((prev) =>
          prev.map((r) =>
            r.id === region.id
              ? { ...r, playSoundOnStart: e.target.checked }
              : r
          )
        )
      }
      style={{ marginRight: 5 }}
    />
    타이머 시작 시 소리 재생
  </label>
</div>
  <input
    type="text"
    inputMode="numeric"
    value={region.restartDetectTime}
    onFocus={(e) => e.target.select()}
    onChange={(e) => {
      const seconds = e.target.value === "" ? 0 : Number(e.target.value);
      setRegions((prev) =>
        prev.map((r) =>
          r.id === region.id
            ? { ...r, restartDetectTime: seconds }
            : r
        )
      );
    }}
    style={{ width: 40, marginLeft: 5 }}
  />
<span> 초 이하일 때 재감지 활성화</span>

<Tooltip
  text="타이머 작동 중에는 감지가 비활성화됩니다. 입력된 시간(기본 10초)보다 타이머 잔여 시간이 낮을 때, 감지가 다시 활성화됩니다."
/>
</div>
            </div>

            <button onClick={() => resetTimer(region.id)}>타이머 초기화</button>
          </div>
        ))}
</div>
</div>
)}
        {presetModal && (
  <PresetModal
    mode={presetModal}
    presets={presets}
    onClose={() => setPresetModal(null)}
    onConfirm={(value) => {
      if (presetModal === "save") {
        savePreset(value);
      } else if (presetModal === "delete") {
        if (value === "") return;
        deletePreset(value);
      } else if (presetModal === "load") {
        if (value === "") return;
        loadPreset(presets[value]);
      }
      setPresetModal(null);
    }}
  />
)}

{noticeModalOpen && (
  <div
    style={{
      position: "fixed", top: 0, left: 0,
      width: "100%", height: "100%",
      background: "rgba(0,0,0,0.7)",
      display: "flex", justifyContent: "center", alignItems: "center",
      zIndex: 2000
    }}
    onClick={() => setNoticeModalOpen(false)}
  >
<div
      style={{
        background: "#222", borderRadius: 8,
        width: 930, height: 600,
        display: "flex", overflow: "hidden"
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          width: 270, borderRight: "1px solid #444",
          overflowY: "auto", padding: 10,
          display: "flex", flexDirection: "column", gap: 4
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: 8, color: "#ffa500" }}>
          📢 공지사항
        </div>
        {notices.map((n) => (
          <div
            key={n.id}
            onClick={() => setSelectedNotice(n)}
            style={{
              padding: "8px 10px", borderRadius: 6, cursor: "pointer",
              background: selectedNotice?.id === n.id ? "#3a3a3a" : "transparent",
              borderLeft: selectedNotice?.id === n.id ? "3px solid #ffa500" : "3px solid transparent",
              fontSize: 14
            }}
          >
            {n.title}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>
        {selectedNotice ? (
          <>
            <h3 style={{ marginTop: 0, color: "#ffa500" }}>
              {selectedNotice.title}
            </h3>
<div style={{ fontSize: 14, color: "#ccc", lineHeight: 1.8, whiteSpace: "pre-line" }}>
              {selectedNotice.content}
            </div>
          </>
        ) : (
          <div style={{ color: "#666" }}>공지를 선택해주세요.</div>
        )}
      </div>
    </div>
  </div>
)}
{contactOpen && (
<form ref={formRef}
style={{
  position:"fixed",
  top:0,
  left:0,
  width:"100%",
  height:"100%",
  background:"rgba(0,0,0,0.7)",
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  zIndex:2000
}}

>
<input type="hidden" name="user_agent" value={navigator.userAgent} />
<input type="hidden" name="app_version" value="1.0.0" />
<input type="hidden" name="timestamp" value={new Date().toISOString()} />


<div
style={{
  background:"#222",
  padding:20,
  borderRadius:8,
  width:500,
display:"flex",
flexDirection:"column",
gap:15,
fontSize:18
}}
>

<h3 style={{ margin:0 }}>
  문의하기
</h3>

<div style={{ fontSize:14, color:"#ccc" }}>
  *사소한 내용도 괜찮으니, 자유롭게 보내주세요. 초고속으로 반영합니다! <br />
  *문의 기능에는 5분의 쿨타임이 있습니다!<br />
  *파일 업로드 기능은 현재 지원하지 않고 있어요. 
<br /><br />
  문의 기능 오류 및 파일 첨부 문의 시, 디스코드 또는 이메일로 보내주세요. <br />
  디스코드 : malancider<br />
  이메일 : malancider@gmail.com
</div>


{/* 카테고리 */}
<select
name="category"
value={contactCategory}
onChange={(e)=>setContactCategory(e.target.value)}
style={{
  width: "100%",
  height: 40,
  fontSize: 15,
  padding: "0 10px",
  borderRadius: 6,
  background: "#2a2a2a",
  color: "white",
  border: "1px solid #555",
  cursor: "pointer"
}}
>
  <option>버그 제보</option>
  <option>기능 제안</option>
  <option>기타 문의</option>
</select>

{/* 제목 */}
<input
style={{
  height:28,
  padding:"0 10px",
  fontSize:15
}}
name="title"
type="text"
placeholder="제목 (선택)"
value={contactTitle}
onChange={(e)=>setContactTitle(e.target.value)}
/>

{/* 이메일 */}
<input
style={{
  height:28,
  padding:"0 10px",
  fontSize:15
}}
name="email"
type="text"
placeholder="이메일 (답변이 필요한 경우 입력해주세요. 선택)"
value={contactEmail}
onChange={(e)=>setContactEmail(e.target.value)}
/>

{/* 내용 */}
<textarea
name="content"
placeholder="내용을 입력해주세요 (필수)"
value={contactContent}
onChange={(e)=>setContactContent(e.target.value)}
style={{
  height:200,
fontSize:14,
padding:10,
  resize:"none"
}}
/>

{/* 파일 */}
<div style={{ fontSize:14, color:"#aaa" }}>
  *보내기 버튼을 누르면 제작자에게 전달됩니다! (내용은 필수입니다.)
</div>

{/* 버튼 */}
<div
style={{
  display:"flex",
  justifyContent:"flex-end",
  gap:10,
  marginTop:10
}}
>

<button onClick={()=>setContactOpen(false)}>
  취소
</button>


<button
disabled={!contactContent.trim()}
style={{
  opacity: contactContent.trim() ? 1 : 0.4,
  cursor: contactContent.trim() ? "pointer" : "not-allowed"
}}
onClick={async (e) => {
  e.preventDefault();

const now = Date.now();
const COOLDOWN = 5 * 60 * 1000; // ✅ 5분

// ⛔ 쿨타임 체크 (절대 시간 기준)
if (now < nextContactTime) {
  const remain = Math.ceil((nextContactTime - now) / 1000);
  alert(`잠시만요! ${remain}초 후에 다시 보낼 수 있어요 🙏`);
  return;
}

  try {
    await emailjs.sendForm(
      "malancider",
      "malancider",
      formRef.current,
      "oFH0ea33EE7hixG94"
    );

    alert("문의가 전송되었습니다! 🙏");

    // ✅ 쿨타임 시작
  const nextTime = now + COOLDOWN;

setNextContactTime(nextTime);
localStorage.setItem("contactCooldown", nextTime);

    setContactOpen(false);

    // 초기화
    setContactTitle("");
    setContactEmail("");
    setContactContent("");

  } catch (error) {
    console.error(error);
    alert("전송 실패 😥");
  }
}}>
  보내기
</button>
</div>
</div>
</form>
)}
{/* ===== 문의 버튼 ===== */}
<button
onClick={() => setContactOpen(true)}
style={{
  position: "fixed",
  right: 480,
  bottom: 48,
  zIndex: 9999,
  background: "linear-gradient(135deg, #c47000 0%, #e08c00 100%)",
  color: "white",
  border: "1px solid rgba(255,165,0,0.4)",
  borderRadius: 12,
  padding: "10px 14px",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 0 14px rgba(255,165,0,0.35), 0 4px 12px rgba(0,0,0,0.5)",
  lineHeight: 1.4,
  fontSize: 14,
  textAlign: "center",
  letterSpacing: "0.3px",
}}
>
  💬 제작자 괴롭히기
  <br />
  <span style={{ fontSize: 12, opacity: 0.85 }}>
    문의 · 버그 제보 환영!
  </span>
</button>
{toast && (
  <div
  style={{
    position: "fixed",
    top: 20,
    left: "50%",
    transform: "translate(-50%, -10px)",
    background: "rgba(30, 30, 30, 0.95)",
    color: "#ffffff",
    padding: "14px 22px",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: "bold",
    zIndex: 9999,
    boxShadow: "0 6px 20px rgba(0,0,0,0.6)",
    border: "1px solid rgba(255,255,255,0.15)",
    backdropFilter: "blur(6px)",
    letterSpacing: "0.3px",
    pointerEvents: "none"
  }}
>
    {toast.message}
  </div>
)}
<Popover data={popover} />
      <canvas ref={hiddenCanvasRef} style={{ display: "none" }} />

{/* ===== 푸터 ===== */}
<div
  style={{
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    height: 36,
    background: "#1a1a1a",
    borderTop: "1px solid #333",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    color: "#666",
    zIndex: 100,
    letterSpacing: "0.3px",
  }}
>
  ⓒ 2026. malancider All rights reserved. · v1.0.0 (Beta)
</div>

    </div>
  );
}
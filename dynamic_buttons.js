// YouTube IFrame API를 로드
const script = document.createElement('script');
script.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(script);

// TXT 파일 경로
const txtFilePath = 'title_videos.txt';

// 현재 재생 중인 iframe과 player 상태 관리
let currentPlayingIframe = null;
let currentPlayingPlayer = null;

// YouTube Player 생성 시 저장소
const players = new Map();

// YouTube API가 준비되었을 때 호출됨
function onYouTubeIframeAPIReady() {
    // fetch를 통해 비디오 데이터를 로딩하고 버튼을 생성
    fetch(txtFilePath)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load TXT file');
            }
            return response.text();
        })
        .then(text => {
            const videoData = parseTxtFile(text); // TXT 데이터를 파싱
            createButtons(videoData); // 버튼 생성
        })
        .catch(error => {
            console.error('Error loading TXT:', error);
        });
}

// 동영상 버튼 생성 함수
function createButtons(videoData) {
    const buttonsContainer = document.getElementById('buttons-container');

    videoData.forEach((video, index) => {
        // 버튼 컨테이너 생성
        const buttonContainer = document.createElement('div');
        buttonContainer.className = "buttons-container"; // CSS 클래스 추가

        // 버튼 생성
        const button = document.createElement('button');
        button.className = "dynamic-button";
        button.textContent = video.title; // 동영상 제목 설정

        // 클릭 이벤트 추가
        button.addEventListener('click', () => toggleVideo(button, video.url, index));

        // 영상 컨테이너 생성
        const videoContainer = document.createElement('div');
        videoContainer.className = "video-container";
        videoContainer.style.display = "none"; // 처음에는 숨김 처리

        // iframe 대신 div 초기화
        const videoIframe = document.createElement('div'); // 유튜브 플레이어가 생성될 div
        videoIframe.id = `player-${index}`; // 고유 ID 할당
        videoContainer.appendChild(videoIframe);

        // 버튼과 영상 컨테이너 연결
        buttonContainer.appendChild(button);
        buttonContainer.appendChild(videoContainer);

        // 전체 버튼 영역에 추가
        buttonsContainer.appendChild(buttonContainer);

        // YouTube Player 초기화
        const player = new YT.Player(videoIframe.id, {
            height: '360',
            width: '640',
            videoId: extractVideoId(video.url),
            playerVars: {
                autoplay: 0,
                controls: 1
            },
            events: {
                onStateChange: onPlayerStateChange
            }
        });

        // 생성된 player를 플레이어 맵에 저장
        players.set(index, player);
    });
}

// 동영상 URL에서 YouTube Video ID 추출
function extractVideoId(url) {
    const urlObj = new URL(url);
    if (urlObj.hostname === "www.youtube.com" || urlObj.hostname === "youtube.com") {
        return urlObj.searchParams.get("v");
    } else if (urlObj.hostname === "youtu.be") {
        return urlObj.pathname.substring(1);
    }
    return null; // 유효하지 않은 경우
}

// 버튼을 클릭했을 때 동영상 토글 처리 함수
function toggleVideo(button, url, index) {
    const videoContainer = button.nextElementSibling; // 버튼 다음에 위치한 비디오 컨테이너
    const player = players.get(index); // 맵에서 유튜브 플레이어 가져오기

    // 다른 영상 정지 및 축소
    if (currentPlayingPlayer && currentPlayingPlayer !== player) {
        currentPlayingPlayer.pauseVideo(); // 이전 플레이어 정지
        if (currentPlayingIframe) {
            currentPlayingIframe.style.display = "none"; // 이전 플레이어 숨기기
        }
    }

    // 현재 iframe 상태 확인 및 처리
    if (videoContainer.style.display === "none" || videoContainer.style.display === "") {
        // 컨테이너 표시
        videoContainer.style.display = "block";

        // 동영상 재생
        player.playVideo();

        // 현재 재생 중인 플레이어 및 iframe 업데이트
        currentPlayingIframe = videoContainer;
        currentPlayingPlayer = player;
    } else {
        // 동영상 일시정지 및 숨김
        player.pauseVideo();
        videoContainer.style.display = "none";

        // 현재 재생 중인 상태 초기화
        currentPlayingIframe = null;
        currentPlayingPlayer = null;
    }
}

// TXT 파일에서 데이터 파싱 함수
function parseTxtFile(text) {
    const lines = text.split("\n").map(line => line.trim());
    const videoData = [];
    let tempTitle = null;

    lines.forEach(line => {
        if (line.startsWith('http') || line.startsWith('https')) {
            if (tempTitle) {
                videoData.push({ title: tempTitle, url: line });
                tempTitle = null;
            }
        } else if (line) {
            tempTitle = line; // 다음 URL을 기다리는 제목 행 처리
        }
    });

    return videoData;
}

// YouTube Player 상태 변화 감지
function onPlayerStateChange(event) {
    // 상태 변화에 따라 특정 작업을 수행하려면 여기서 처리 가능
    // 예: event.data 값을 통해 상태를 확인 (재생, 일시 정지 등 상태)
}

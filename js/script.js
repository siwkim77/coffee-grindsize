document.addEventListener('DOMContentLoaded', () => {
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
});

// 데이터 로드 또는 초기화
let grinderData;

fetch('json/init_data.json')
    .then(response => response.json())
    .then(data => {
        grinderData = JSON.parse(localStorage.getItem('grinderData')) || data;
        initialize();
    })
    .catch(error => console.error('초기 데이터를 불러오는 중 오류가 발생했습니다:', error));

// DOM 요소 참조
const grinderTypeSelect = document.getElementById('grinderType');
const beanCharacteristicSelect = document.getElementById('beanCharacteristic');
const selectGrinder = document.getElementById('selectGrinder');
const selectBeanCharacteristic = document.getElementById('selectBeanCharacteristic');
const addBeanSelectGrinder = document.getElementById('addBeanSelectGrinder');
const toggleButtons = document.querySelectorAll('.toggle-btn');
const addGrinderForm = document.getElementById('addGrinderForm');
const addBeanCharacteristicForm = document.getElementById('addBeanCharacteristicForm');
const addDataForm = document.getElementById('addDataForm');
const resultDiv = document.getElementById('result');

// 초기화 함수
function initialize() {
    populateGrinderTypes();
    populateBeanCharacteristics();
    populateSelectGrinder();
    populateSelectBeanCharacteristic();
    populateAddBeanSelectGrinder();
    updateResultMessage("그라인더와 원두 특징을 선택하고 \n 값을 입력하세요.");
}

// 그라인더 종류 드롭다운 채우기
function populateGrinderTypes() {
    grinderTypeSelect.innerHTML = '';
    for (let grinder in grinderData) {
        const option = document.createElement('option');
        option.value = grinder;
        option.textContent = grinder;
        grinderTypeSelect.appendChild(option);
    }
}

// 원두 특징 드롭다운 채우기
function populateBeanCharacteristics() {
    const selectedGrinder = grinderTypeSelect.value;
    beanCharacteristicSelect.innerHTML = '';
    if (selectedGrinder && grinderData[selectedGrinder]) {
        for (let characteristic in grinderData[selectedGrinder]) {
            const option = document.createElement('option');
            option.value = characteristic;
            option.textContent = characteristic;
            beanCharacteristicSelect.appendChild(option);
        }
    }
}

// 데이터 추가 섹션의 그라인더 선택 드롭다운 채우기
function populateSelectGrinder() {
    selectGrinder.innerHTML = '';
    for (let grinder in grinderData) {
        const option = document.createElement('option');
        option.value = grinder;
        option.textContent = grinder;
        selectGrinder.appendChild(option);
    }
}

// 원두 특징 추가 폼의 그라인더 선택 드롭다운 채우기
function populateAddBeanSelectGrinder() {
    addBeanSelectGrinder.innerHTML = '';
    for (let grinder in grinderData) {
        const option = document.createElement('option');
        option.value = grinder;
        option.textContent = grinder;
        addBeanSelectGrinder.appendChild(option);
    }
}

// 데이터 추가 섹션의 원두 특징 선택 드롭다운 채우기
function populateSelectBeanCharacteristic() {
    selectBeanCharacteristic.innerHTML = '';
    const selectedGrinder = selectGrinder.value;
    if (selectedGrinder && grinderData[selectedGrinder]) {
        for (let characteristic in grinderData[selectedGrinder]) {
            const option = document.createElement('option');
            option.value = characteristic;
            option.textContent = characteristic;
            selectBeanCharacteristic.appendChild(option);
        }
    }
}

// 그라인더 선택 시 원두 특징 업데이트
grinderTypeSelect.addEventListener('change', () => {
    populateBeanCharacteristics();
    clearInputs();
    updateResultMessage("그라인더와 원두 특징을 선택하고\n값을 입력하세요.");
});

// 데이터 추가 섹션의 그라인더 선택 시 원두 특징 업데이트
selectGrinder.addEventListener('change', () => {
    populateSelectBeanCharacteristic();
    renderDataList();
});

// 원두 특징 선택 시 입력 필드 초기화
beanCharacteristicSelect.addEventListener('change', () => {
    clearInputs();
    updateResultMessage("클릭 수 또는 분쇄도를 입력하세요.");
    renderDataList();
});

// 입력 필드 동기화 플래그
let isUpdating = false;

// 클릭 수로 분쇄도 찾기 (정수 처리)
function findGrindFromClicks(inputClicks, data) {
    for (let i = 0; i < data.length - 1; i++) {
        if (inputClicks === data[i].clicks) {
            return data[i].grind;
        }
        if (inputClicks > data[i].clicks) {
            return "분쇄도가 너무 굵습니다.";
        }
        if (inputClicks < data[i].clicks && inputClicks > data[i + 1].clicks) {
            const ratio = (inputClicks - data[i + 1].clicks) / (data[i].clicks - data[i + 1].clicks);
            const grind = data[i + 1].grind + ratio * (data[i].grind - data[i + 1].grind);
            return grind.toFixed(1) + " µm";
        }
    }
    if (inputClicks < data[data.length - 1].clicks) {
        return "분쇄도가 너무 곱습니다.";
    }
    return "알 수 없는 입력입니다.";
}

// 분쇄도로 클릭 수 찾기 (정수 처리)
function findClicksFromGrind(inputGrind, data) {
    for (let i = 0; i < data.length - 1; i++) {
        if (inputGrind === data[i].grind) {
            return data[i].clicks + " 클릭";
        }
        if (inputGrind < data[i].grind && inputGrind > data[i + 1].grind) {
            const ratio = (inputGrind - data[i + 1].grind) / (data[i].grind - data[i + 1].grind);
            const clicks = data[i + 1].clicks + ratio * (data[i].clicks - data[i + 1].clicks);
            return clicks.toFixed(0) + " 클릭";
        }
    }
    if (inputGrind > data[0].grind) {
        return "클릭 수가 너무 큽니다.";
    }
    if (inputGrind < data[data.length - 1].grind) {
        return "클릭 수가 너무 작습니다.";
    }
    return "알 수 없는 입력입니다.";
}

// 결과 메시지 업데이트
function updateResultMessage(message) {
    resultDiv.innerText = message;
}

// 입력 필드 초기화
function clearInputs() {
    document.getElementById('clicks').value = '';
    document.getElementById('grind').value = '';
}

// 클릭 수 입력 시 변환 (수정된 부분)
document.getElementById('clicks').addEventListener('input', () => {
    if (isUpdating) return;
    isUpdating = true;
    const clicksInput = document.getElementById('clicks').value;
    const clicks = parseInt(clicksInput, 10);
    const selectedGrinder = grinderTypeSelect.value;
    const selectedCharacteristic = beanCharacteristicSelect.value;

    if (selectedGrinder && selectedCharacteristic && grinderData[selectedGrinder][selectedCharacteristic]) {
        const data = grinderData[selectedGrinder][selectedCharacteristic];
        if (!isNaN(clicks)) {
            const grind = findGrindFromClicks(clicks, data);
            if (!isNaN(parseFloat(grind))) {
                updateResultMessage(`분쇄도: ${grind}μm`);
                document.getElementById('grind').value = parseFloat(grind);
            } else {
                updateResultMessage(grind);
                document.getElementById('grind').value = '';
            }
        } else {
            updateResultMessage("유효한 클릭 수를 입력해주세요.");
            document.getElementById('grind').value = '';
        }
    } else {
        updateResultMessage("그라인더와 원두 특징을 선택해주세요.");
    }
    isUpdating = false;
});

// 분쇄도 입력 시 변환 (수정된 부분)
document.getElementById('grind').addEventListener('input', () => {
    if (isUpdating) return;
    isUpdating = true;
    const grindInput = document.getElementById('grind').value;
    const grind = parseInt(grindInput, 10);
    const selectedGrinder = grinderTypeSelect.value;
    const selectedCharacteristic = beanCharacteristicSelect.value;

    if (selectedGrinder && selectedCharacteristic && grinderData[selectedGrinder][selectedCharacteristic]) {
        const data = grinderData[selectedGrinder][selectedCharacteristic];
        if (!isNaN(grind)) {
            const clicks = findClicksFromGrind(grind, data);
            if (!isNaN(parseFloat(clicks))) {
                updateResultMessage(`${clicks}`);
                document.getElementById('clicks').value = parseFloat(clicks);
            } else {
                updateResultMessage(clicks);
                document.getElementById('clicks').value = '';
            }
        } else {
            updateResultMessage("유효한 분쇄도를 입력해주세요.");
            document.getElementById('clicks').value = '';
        }
    } else {
        updateResultMessage("그라인더와 원두 특징을 선택해주세요.");
    }
    isUpdating = false;
});

// 데이터 추가 섹션 버튼 클릭 시 폼 토글
toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-target');
        const targetForm = document.getElementById(targetId);

        // 다른 폼을 닫기
        document.querySelectorAll('.add-form').forEach(form => {
            if (form !== targetForm) {
                form.classList.remove('active');
            }
        });

        // 현재 폼 토글
        targetForm.classList.toggle('active');
    });
});

// 그라인더 추가 함수
function addGrinder() {
    const newGrinder = document.getElementById('newGrinder').value.trim();
    if (newGrinder === '') {
        alert("그라인더 이름을 입력해주세요.");
        return;
    }
    if (grinderData.hasOwnProperty(newGrinder)) {
        alert("이미 존재하는 그라인더 이름입니다.");
        return;
    }
    grinderData[newGrinder] = {};
    saveData();
    populateGrinderTypes();
    populateSelectGrinder();
    populateAddBeanSelectGrinder();
    populateBeanCharacteristics();
    populateSelectBeanCharacteristic();
    document.getElementById('newGrinder').value = '';
    alert("그라인더가 성공적으로 추가되었습니다.");
    renderDataList();
}

// 원두 특징 추가 함수
function addBeanCharacteristic() {
    const newCharacteristic = document.getElementById('newBeanCharacteristic').value.trim();
    const selectedGrinder = addBeanSelectGrinder.value;
    if (newCharacteristic === '') {
        alert("원두 특징 이름을 입력해주세요.");
        return;
    }
    if (selectedGrinder === '') {
        alert("원두 특징을 추가할 그라인더를 선택해주세요.");
        return;
    }
    if (grinderData[selectedGrinder].hasOwnProperty(newCharacteristic)) {
        alert("이미 존재하는 원두 특징 이름입니다.");
        return;
    }
    grinderData[selectedGrinder][newCharacteristic] = [];
    saveData();
    populateBeanCharacteristics();
    populateSelectBeanCharacteristic();
    document.getElementById('newBeanCharacteristic').value = '';
    alert("원두 특징이 성공적으로 추가되었습니다.");
    renderDataList();
}

// 데이터 추가 함수
function addData() {
    const selectedGrinder = document.getElementById('selectGrinder').value;
    const selectedCharacteristic = document.getElementById('selectBeanCharacteristic').value;
    const newClicks = parseInt(document.getElementById('newClicks').value, 10);
    const newGrind = parseInt(document.getElementById('newGrind').value, 10);

    if (!selectedGrinder || !selectedCharacteristic) {
        alert("그라인더와 원두 특징을 선택해주세요.");
        return;
    }
    if (isNaN(newClicks) || isNaN(newGrind)) {
        alert("유효한 클릭 수와 분쇄도를 입력해주세요.");
        return;
    }

    // 중복 클릭 수 또는 분쇄도 확인
    const existingData = grinderData[selectedGrinder][selectedCharacteristic];
    for (let entry of existingData) {
        if (entry.clicks === newClicks || entry.grind === newGrind) {
            alert("이미 동일한 클릭 수 또는 분쇄도가 존재합니다.");
            return;
        }
    }

    grinderData[selectedGrinder][selectedCharacteristic].push({ clicks: newClicks, grind: newGrind });
    // 정렬 (클릭 수 내림차순)
    grinderData[selectedGrinder][selectedCharacteristic].sort((a, b) => b.clicks - a.clicks);
    saveData();
    document.getElementById('newClicks').value = '';
    document.getElementById('newGrind').value = '';
    alert("데이터가 성공적으로 추가되었습니다.");
    renderDataList();
}

// 데이터 삭제 함수
function deleteData(grinder, characteristic, index) {
    if (confirm("해당 데이터를 정말 삭제하시겠습니까?")) {
        grinderData[grinder][characteristic].splice(index, 1);
        saveData();
        alert("데이터가 성공적으로 삭제되었습니다.");
        renderDataList();
    }
}

// 데이터 저장 함수
function saveData() {
    localStorage.setItem('grinderData', JSON.stringify(grinderData));
}

// 데이터 목록 렌더링 함수 (추가된 함수, 기존 코드에 없을 경우 필요)
function renderDataList() {
    // 이 함수는 데이터 관리 페이지에서 데이터 목록을 렌더링하는 역할을 합니다.
    // 필요에 따라 구현해 주세요.
}

// 초기화 실행
initialize();
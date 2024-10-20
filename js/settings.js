// 데이터 로드 또는 초기화
let grinderData;

function loadInitialData() {
    return fetch('json/init_data.json')
        .then(response => response.json())
        .catch(error => {
            console.error('초기 데이터를 불러오는 중 오류가 발생했습니다:', error);
            return {}; // 오류 발생 시 빈 객체 반환
        });
}

loadInitialData().then(data => {
    grinderData = JSON.parse(localStorage.getItem('grinderData')) || data;
    initialize();
});

// DOM 요소 참조
const viewGrinderTypeSelect = document.getElementById('viewGrinderType');
const viewBeanCharacteristicSelect = document.getElementById('viewBeanCharacteristic');
const dataList = document.getElementById('dataList');
const noDataMessage = document.getElementById('noDataMessage');
const dataTable = document.getElementById('dataTable');
const exportJsonBtn = document.getElementById('exportJson');
const importJsonBtn = document.getElementById('importJson');
const updateJsonBtn = document.getElementById('updateJson');
const resetDataBtn = document.getElementById('resetData');
const importFileInput = document.getElementById('importFile');

// 초기화 함수
function initialize() {
    populateGrinderTypes();
    populateBeanCharacteristics();
}

document.addEventListener('DOMContentLoaded', () => {
    const themeSwitch = document.getElementById('themeSwitch');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeSwitch.checked = true;
    }

    themeSwitch.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    });
});

// 그라인더 종류 드롭다운 채우기
function populateGrinderTypes() {
    viewGrinderTypeSelect.innerHTML = '<option value="">그라인더 선택</option>';
    for (let grinder in grinderData) {
        const option = document.createElement('option');
        option.value = grinder;
        option.textContent = grinder;
        viewGrinderTypeSelect.appendChild(option);
    }
}

// 원두 특징 드롭다운 채우기
function populateBeanCharacteristics() {
    const selectedGrinder = viewGrinderTypeSelect.value;
    viewBeanCharacteristicSelect.innerHTML = '<option value="">원두 특징 선택</option>';
    if (selectedGrinder && grinderData[selectedGrinder]) {
        for (let characteristic in grinderData[selectedGrinder]) {
            const option = document.createElement('option');
            option.value = characteristic;
            option.textContent = characteristic;
            viewBeanCharacteristicSelect.appendChild(option);
        }
    }
}

// 그라인더 선택 시 원두 특징 업데이트
viewGrinderTypeSelect.addEventListener('change', () => {
    populateBeanCharacteristics();
    renderDataList();
});

// 원두 특징 선택 시 데이터 목록 업데이트
viewBeanCharacteristicSelect.addEventListener('change', () => {
    renderDataList();
});

// 데이터 삭제 함수
function deleteData(grinder, characteristic, index) {
    if (confirm("해당 데이터를 정말 삭제하시겠습니까?")) {
        grinderData[grinder][characteristic].splice(index, 1);
        saveData();
        renderDataList();
        alert("데이터가 성공적으로 삭제되었습니다.");
    }
}

// 데이터 저장 함수
function saveData() {
    localStorage.setItem('grinderData', JSON.stringify(grinderData));
}

// 데이터 목록 렌더링 함수
function renderDataList() {
    const selectedGrinder = viewGrinderTypeSelect.value;
    const selectedCharacteristic = viewBeanCharacteristicSelect.value;

    if (selectedGrinder && selectedCharacteristic && grinderData[selectedGrinder][selectedCharacteristic].length > 0) {
        noDataMessage.style.display = 'none';
        dataTable.style.display = 'block';
        dataTable.innerHTML = '';

        const data = grinderData[selectedGrinder][selectedCharacteristic];

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const thClicks = document.createElement('th');
        thClicks.textContent = "클릭 수";
        const thGrind = document.createElement('th');
        thGrind.textContent = "분쇄도 (µm)";
        const thAction = document.createElement('th');
        thAction.textContent = "삭제";

        headerRow.appendChild(thClicks);
        headerRow.appendChild(thGrind);
        headerRow.appendChild(thAction);
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        data.forEach((item, index) => {
            const row = document.createElement('tr');

            const tdClicks = document.createElement('td');
            tdClicks.textContent = item.clicks;

            const tdGrind = document.createElement('td');
            tdGrind.textContent = item.grind;

            const tdAction = document.createElement('td');
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 290 290">
                    <path d="M265,60h-30h-15V15c0-8.284-6.716-15-15-15H85c-8.284,0-15,6.716-15,15v45H55H25c-8.284,0-15,6.716-15,15s6.716,15,15,15
                        h5.215H40h210h9.166H265c8.284,0,15-6.716,15-15S273.284,60,265,60z M190,60h-15h-60h-15V30h90V60z"/>
                    <path d="M40,275c0,8.284,6.716,15,15,15h180c8.284,0,15-6.716,15-15V120H40V275z"/>
                </svg>
            `;
            deleteBtn.setAttribute('aria-label', '삭제');
            deleteBtn.onclick = () => deleteData(selectedGrinder, selectedCharacteristic, index);
            tdAction.appendChild(deleteBtn);

            row.appendChild(tdClicks);
            row.appendChild(tdGrind);
            row.appendChild(tdAction);

            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        dataTable.appendChild(table);
    } else {
        dataTable.style.display = 'none';
        noDataMessage.style.display = 'block';
        noDataMessage.textContent = "그라인더와 원두 특징을 선택하세요";
    }
}

// JSON으로 백업하는 함수
function exportToJson() {
    const dataStr = JSON.stringify(grinderData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'grinderData_backup.json';
    a.click();

    URL.revokeObjectURL(url);
}

// 데이터 병합 함수 (중복 제외: 동일 그라인더, 원두 특징, 클릭 수)
function mergeData(importedData) {
    let newEntries = 0;

    for (let grinder in importedData) {
        if (!grinderData.hasOwnProperty(grinder)) {
            grinderData[grinder] = {};
        }

        for (let characteristic in importedData[grinder]) {
            if (!grinderData[grinder].hasOwnProperty(characteristic)) {
                grinderData[grinder][characteristic] = [];
            }

            importedData[grinder][characteristic].forEach(importedEntry => {
                const isDuplicate = grinderData[grinder][characteristic].some(existingEntry => 
                    existingEntry.clicks === importedEntry.clicks && existingEntry.grind === importedEntry.grind
                );

                if (!isDuplicate) {
                    grinderData[grinder][characteristic].push({
                        clicks: importedEntry.clicks,
                        grind: importedEntry.grind
                    });
                    newEntries++;
                }
            });

            grinderData[grinder][characteristic].sort((a, b) => b.clicks - a.clicks);
        }
    }

    return newEntries;
}

// JSON을 불러오는 함수 (중복 제외하고 병합)
function importFromJson(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const importedData = JSON.parse(event.target.result);
            if (validateImportedData(importedData)) {
                const addedEntries = mergeData(importedData);
                saveData();
                populateGrinderTypes();
                populateBeanCharacteristics();
                renderDataList();
                if (addedEntries > 0) {
                    alert("데이터가 성공적으로 불러와졌습니다.");
                } else {
                    alert("불러온 데이터에 변경 사항이 없습니다.");
                }
            } else {
                alert("유효하지 않은 데이터 형식입니다.");
            }
        } catch (error) {
            alert("JSON 파일을 읽는 중 오류가 발생했습니다.");
            console.error(error);
        }
    };
    reader.readAsText(file);
}

// 불러온 데이터의 유효성 검사 함수
function validateImportedData(data) {
    if (typeof data !== 'object' || Array.isArray(data) || data === null) return false;
    for (let grinder in data) {
        if (typeof data[grinder] !== 'object' || Array.isArray(data[grinder]) || data[grinder] === null) return false;
        for (let characteristic in data[grinder]) {
            if (!Array.isArray(data[grinder][characteristic])) return false;
            for (let entry of data[grinder][characteristic]) {
                if (typeof entry.clicks !== 'number' || typeof entry.grind !== 'number') return false;
                if (!Number.isInteger(entry.clicks)) return false;
            }
        }
    }
    return true;
}

// 초기화 버튼 클릭 시 모든 데이터 삭제하고 기본 데이터로 복원
function resetData() {
    if (confirm("모든 데이터를 삭제하고 기본 데이터로 초기화하시겠습니까?")) {
        loadInitialData().then(data => {
            grinderData = data;
            saveData();
            populateGrinderTypes();
            populateBeanCharacteristics();
            renderDataList();
            alert("모든 데이터가 초기화되었습니다.");
        });
    }
}

// 업데이트 버튼 클릭 시 업데이트 파일 자동 불러오기
function updateJson() {
    const filePath = `update/update.json`;

    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`파일을 찾을 수 없습니다: ${filePath}`);
            }
            return response.json();
        })
        .then(importedData => {
            if (validateImportedData(importedData)) {
                const addedEntries = mergeData(importedData);
                saveData();
                populateGrinderTypes();
                populateBeanCharacteristics();
                renderDataList();
                if (addedEntries > 0) {
                    alert(`업데이트 파일(${filePath})이 성공적으로 병합되었습니다. 추가된 데이터 수: ${addedEntries}`);
                } else {
                    alert("데이터베이스가 이미 최신 상태입니다.");
                }
            } else {
                alert("유효하지 않은 데이터 형식입니다.");
            }
        })
        .catch(error => {
            alert(`업데이트 파일을 불러오는 중 오류가 발생했습니다.\n${error.message}`);
            console.error(error);
        });
}

// 백업 버튼 클릭 시 JSON으로 백업
exportJsonBtn.addEventListener('click', exportToJson);

// 불러오기 버튼 클릭 시 파일 선택 창 열기
importJsonBtn.addEventListener('click', () => {
    importFileInput.click();
});

// 업데이트 버튼 클릭 시 업데이트 함수 호출
updateJsonBtn.addEventListener('click', updateJson);

// 초기화 버튼 클릭 시 초기화 함수 호출
resetDataBtn.addEventListener('click', resetData);

// 파일 선택 시 JSON 불러오기 (여러 파일 지원)
importFileInput.addEventListener('change', (event) => {
    const files = event.target.files;
    if (files.length === 0) {
        alert("JSON 파일을 선택해주세요.");
        return;
    }

    let validFiles = Array.from(files).filter(file => file.type === "application/json");
    if (validFiles.length === 0) {
        alert("유효한 JSON 파일을 선택해주세요.");
        return;
    }

    let processedCount = 0;
    let totalAddedEntries = 0;

    validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const importedData = JSON.parse(event.target.result);
                if (validateImportedData(importedData)) {
                    const addedEntries = mergeData(importedData);
                    totalAddedEntries += addedEntries;
                    saveData();
                    populateGrinderTypes();
                    populateBeanCharacteristics();
                    renderDataList();
                    processedCount++;
                    if (processedCount === validFiles.length) {
                        if (totalAddedEntries > 0) {
                            alert(`선택한 JSON 파일이 성공적으로 불러와졌습니다. 추가된 데이터 수: ${totalAddedEntries}`);
                        } else {
                            alert("선택한 JSON 파일에 변경 사항이 없습니다.");
                        }
                    }
                } else {
                    alert(`파일 ${file.name}의 데이터 형식이 유효하지 않습니다.`);
                    processedCount++;
                    if (processedCount === validFiles.length) {
                        if (totalAddedEntries > 0) {
                            alert(`선택한 JSON 파일이 성공적으로 불러와졌습니다. 추가된 데이터 수: ${totalAddedEntries}`);
                        } else {
                            alert("선택한 JSON 파일에 변경 사항이 없습니다.");
                        }
                    }
                }
            } catch (error) {
                alert(`파일 ${file.name}을 읽는 중 오류가 발생했습니다.`);
                console.error(error);
                processedCount++;
                if (processedCount === validFiles.length) {
                    if (totalAddedEntries > 0) {
                        alert(`선택한 JSON 파일이 성공적으로 불러와졌습니다. 추가된 데이터 수: ${totalAddedEntries}`);
                    } else {
                        alert("선택한 JSON 파일에 변경 사항이 없습니다.");
                    }
                }
            }
        };
        reader.readAsText(file);
    });
});

// 초기화 실행
initialize();

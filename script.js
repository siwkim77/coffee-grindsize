const defaultData = {
    "1Zpresso K-Ultra": {
      "약배전 에티오피아 내추럴": [
        { "clicks": 100, "grind": 1220 },
        { "clicks": 95, "grind": 1150 },
        { "clicks": 90, "grind": 1080 },
        { "clicks": 85, "grind": 1040 },
        { "clicks": 80, "grind": 980 },
        { "clicks": 75, "grind": 940 },
        { "clicks": 70, "grind": 900 },
        { "clicks": 65, "grind": 875 },
        { "clicks": 60, "grind": 850 },
        { "clicks": 55, "grind": 800 },
        { "clicks": 50, "grind": 750 },
        { "clicks": 45, "grind": 700 },
        { "clicks": 40, "grind": 650 }
      ]
    },
    "KINGrinder K6": {
      "약배전 에티오피아 내추럴": [
        { "clicks": 130, "grind": 1300 },
        { "clicks": 120, "grind": 1200 },
        { "clicks": 110, "grind": 1100 },
        { "clicks": 100, "grind": 1000 },
        { "clicks": 90, "grind": 950 },
        { "clicks": 80, "grind": 900 },
        { "clicks": 70, "grind": 850 },
        { "clicks": 60, "grind": 750 },
        { "clicks": 50, "grind": 650 }
      ]
    },
    "1Zpresso ZP6": {
      "약배전 에티오피아 내추럴": [
        { "clicks": 66, "grind": 1163 },
        { "clicks": 61, "grind": 1100 },
        { "clicks": 56, "grind": 1037 },
        { "clicks": 51, "grind": 985 },
        { "clicks": 46, "grind": 900 },
        { "clicks": 41, "grind": 850 },
        { "clicks": 36, "grind": 775 },
        { "clicks": 31, "grind": 700 },
        { "clicks": 26, "grind": 650 },
        { "clicks": 21, "grind": 600 },
        { "clicks": 16, "grind": 524 }
      ]
    }
  };
  
  // 데이터 로드 또는 초기화
  let grinderData = JSON.parse(localStorage.getItem('grinderData')) || defaultData;
  
  // DOM 요소 참조
  const grinderTypeSelect = document.getElementById('grinderType');
  const beanCharacteristicSelect = document.getElementById('beanCharacteristic');
  const selectGrinder = document.getElementById('selectGrinder');
  const selectBeanCharacteristic = document.getElementById('selectBeanCharacteristic');
  const toggleAddDataBtn = document.getElementById('toggleAddData');
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
              return "클릭 수가 너무 높습니다.";
          }
          if (inputClicks < data[i].clicks && inputClicks > data[i+1].clicks) {
              const ratio = (inputClicks - data[i+1].clicks) / (data[i].clicks - data[i+1].clicks);
              const grind = data[i+1].grind + ratio * (data[i].grind - data[i+1].grind);
              return grind.toFixed(1) + " µm";
          }
      }
      if (inputClicks < data[data.length -1].clicks) {
          return "클릭 수가 너무 낮습니다.";
      }
      return "알 수 없는 입력입니다.";
  }
  
  // 분쇄도로 클릭 수 찾기 (정수 처리)
  function findClicksFromGrind(inputGrind, data) {
      for (let i = 0; i < data.length -1; i++) {
          if (inputGrind === data[i].grind) {
              return data[i].clicks;
          }
          if (inputGrind < data[i].grind && inputGrind > data[i+1].grind) {
              const ratio = (inputGrind - data[i+1].grind) / (data[i].grind - data[i+1].grind);
              const clicks = data[i+1].clicks + ratio * (data[i].clicks - data[i+1].clicks);
              return clicks.toFixed(0) + " 클릭";
          }
      }
      if (inputGrind > data[0].grind) {
          return "분쇄도가 너무 큽니다.";
      }
      if (inputGrind < data[data.length -1].grind) {
          return "분쇄도가 너무 작습니다.";
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
  
  // 클릭 수 입력 시 변환 (정수 처리)
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
              updateResultMessage(`분쇄도: ${grind}`);
              // 분쇄도 필드 업데이트
              if (!isNaN(parseFloat(grind))) {
                  const grindValue = parseFloat(grind);
                  document.getElementById('grind').value = grindValue;
              } else {
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
  
  // 분쇄도 입력 시 변환 (정수 처리)
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
              updateResultMessage(`클릭 수: ${clicks}`);
              // 클릭 수 필드 업데이트
              if (!isNaN(parseFloat(clicks))) {
                  const clicksValue = parseFloat(clicks);
                  document.getElementById('clicks').value = clicksValue;
              } else {
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
  
  // 데이터 추가 섹션 토글
  toggleAddDataBtn.addEventListener('click', () => {
      addGrinderForm.classList.toggle('active');
      addBeanCharacteristicForm.classList.toggle('active');
      addDataForm.classList.toggle('active');
      toggleAddDataBtn.textContent = toggleAddDataBtn.textContent === "데이터 추가하기" ? "데이터 숨기기" : "데이터 추가하기";
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
      populateBeanCharacteristics();
      populateSelectBeanCharacteristic();
      document.getElementById('newGrinder').value = '';
      alert("그라인더가 성공적으로 추가되었습니다.");
      renderDataList();
  }
  
  // 원두 특징 추가 함수
  function addBeanCharacteristic() {
      const newCharacteristic = document.getElementById('newBeanCharacteristic').value.trim();
      const selectedGrinder = selectGrinder.value;
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
  
  // 데이터 목록 렌더링 함수
  function renderDataList() {
      // 현재 메인 페이지에는 데이터 목록이 없으므로 이 함수는 필요 없습니다.
      // 데이터 관리 페이지에서 별도로 구현됩니다.
  }
  
  // 초기화 실행
  initialize();
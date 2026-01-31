
```css
.toast-container {
  position: fixed; 
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;

  background-color: rgba(231, 76, 60, 0.95);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

  cursor: pointer;
  animation: slideDown 0.3s ease-out;
  display: flex;
  align-items: center;
  gap: 10px;
  pointer-events: auto;
}
```
크게 위치 잡기, 모양 꾸미기, 내부 배치, 동작 및 애니메이션 네 가지 역할로 나누어 볼 수 있습니다.

1. 위치 잡기 (화면 중앙 상단 고정)
position: fixed;: 스크롤을 내려도 토스트 메시지가 따라오지 않고 화면의 특정 위치에 고정되게 합니다.
top: 80px;: 화면 맨 위에서 80px 아래로 떨어진 곳에 배치합니다.
left: 50%;: 화면의 가로 너비를 기준으로 **정확히 50% 지점(중앙)**에서 시작하게 합니다.
transform: translateX(-50%);: left: 50%만 쓰면 요소의 왼쪽 끝이 중앙에 오게 되어 전체적으로 오른쪽으로 치우칩니다. 이 속성은 요소 자기 너비의 절반만큼 왼쪽으로 다시 이동시켜 완벽한 가로 중앙 정렬을 만듭니다.
z-index: 2000;: 다른 요소들(게임 보드, 모달 등)보다 더 위에 뜨도록 우선순위를 높게 설정합니다.

2. 모양 꾸미기 (붉은색 알림창)
background-color: rgba(231, 76, 60, 0.95);: 배경색을 약간 투명한 붉은색으로 설정합니다. (에러 메시지 느낌)
color: white;: 글자색을 흰색으로 하여 붉은 배경 위에서 잘 보이게 합니다.
padding: 12px 24px;: 글자와 테두리 사이에 여백을 주어 답답해 보이지 않게 합니다.
border-radius: 8px;: 모서리를 둥글게 깎아 부드러운 느낌을 줍니다.
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);: 아래쪽에 그림자를 주어 화면에서 살짝 떠 있는 듯한 입체감을 줍니다.

3. 내부 배치 (아이콘과 텍스트 정렬)
display: flex;: 내부 요소(아이콘, 메시지)를 가로로 나란히 배치하기 위해 플렉스 박스를 사용합니다.
align-items: center;: 아이콘과 텍스트의 높이가 달라도 수직 중앙을 맞춰 깔끔하게 정렬합니다.
gap: 10px;: 아이콘과 메시지 사이에 10px 간격을 띄웁니다.

4. 동작 및 애니메이션
cursor: pointer;: 마우스를 올렸을 때 커서가 손가락 모양으로 변해, 클릭해서 닫을 수 있음을 알려줍니다.
animation: slideDown 0.3s ease-out;: 등장할 때 slideDown 애니메이션을 0.3초 동안 실행합니다. ease-out은 끝날 때 속도가 줄어들어 부드럽게 멈추는 효과를 줍니다.
pointer-events: auto;: 마우스 클릭 이벤트를 정상적으로 받도록 설정합니다. (혹시 부모 요소가 클릭을 막고 있더라도 이 요소는 클릭되게 함)
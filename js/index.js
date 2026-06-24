$(function() {
    // 기준점을 넘어갈때의 네비게이션 너비 확장

    // 변수 선언
    const $nav = $('nav');                      // 네비게이션
    const $navChildren = $nav.find('ul, li');   // 네비게이션 목록과 메뉴
    const navTrigger = $('#navTrigger')[0];     // 네비게이션 확장 트리거(관찰대상)

    // IntersectionObserver(특정 요소가 보이면 알려줌) 생성
    const navObserver = new IntersectionObserver((entries) => {
        // 감시 중인 요소들 중 상태가 바뀐 요소들을 하나씩 확인
        entries.forEach(entry => {
            // 관찰 대상이 현재 화면에 보이지 않으면(기준점 아래로 내려갔다면)
            if (!entry.isIntersecting) {
                // 네비게이션, 목록, 메뉴에 over 클래스 추가
                $nav.addClass('over');
                $navChildren.addClass('over');
                
                // 아직 기준점 아래에 있는지 확인 후 100ms 뒤에 scroll 클래스 추가
                setTimeout(() => { if (!$nav.hasClass('scroll')) $nav.addClass('scroll'); }, 100);
            }
            // 관찰 대상이 화면에 보인다면(최상단으로 올라오면)
            else {
                // 네비게이션의 scroll, over 클래스 제거
                // 네비게이션 목록과 메뉴에 over 클래스 제거
                $nav.removeClass('scroll over');
                $navChildren.removeClass('over');
            }
        });
    }, {
        // 관찰 옵션
        root: null,         // 감시할 기준 영역 설정(null = 뷰포트)
        rootMargin: '0px',  // 별도 여백 없이 요소가 닿는 그 순간에 감지
        threshold: 0        // 요소가 1px이라도 닿는 순간 실행
    });

    // 관찰 시작
    navObserver.observe(navTrigger);

    // --------------------------

    // 위치에 따른 네비게이션 강조 변화

    // 변수 선언
    const $sections = $('#home, #about, #works, #dWorks'); // 관찰 대상
    const $navMenus = $('#navList > li > a');                  // 네비게이션 메뉴
    let isScrolling = false;                               // 관찰을 멈출지 결정하는 변수
    
    // IntersectionObserver(특정 요소가 보이면 알려줌) 생성
    const sectionObserver = new IntersectionObserver((entries) => {
        // 스크롤 이동 중이면 관찰자 무시
        if(isScrolling) return;

        // 감시 중인 요소들 중 상태가 바뀐 요소들을 하나씩 확인
        entries.forEach(entry => {
            // 감시 중인 섹션이 화면에 들어왔다면
            if (entry.isIntersecting) {
                // 화면에 들어온 섹션의 id값을 변수에 저장
                // entry.target은 순수 DOM 요소이므로 $(entry.target)으로 감싸서 제이쿼리 메서드 사용
                let id = $(entry.target).attr('id');
                
                // 섹션의 아이디가 dWorks라면 works로 변경
                // 디자인 작업물 페이지에 들어와도 works 메뉴가 켜지게
                if (id === 'dWorks') id = 'works';
                
                // 모든 메뉴의 on 클래스 제거
                $navMenus.removeClass('on');
                
                // 화면 중앙에 있는 섹션의 id와 같은 href 값을 가진 메뉴의 부모 요소(li)에 on 클래스 추가
                $(`#navList a[href="#${id}"]`).addClass('on');
            }
        });
    }, {
        // 감시 옵션
        root: null,                         // 감시할 기준 영역 설정(null = 뷰포트)
        rootMargin: '-60% 0px -40% 0px',    // 화면 정중앙 감지(상하좌우 여백)
        threshold: 0                        // 요소가 1px이라도 닿는 순간 실행
    });

    // 모든 섹션을 감시자에게 전달해 감시 시작(this는 순수 DOM 요소를 의미)
    $sections.each(function() { sectionObserver.observe(this); });

    // 변수 선언
    let isFooterActive = false; // footer 부분에 해당하는 네비게이션 메뉴가 활성화되었는지
    let footerTimer;            // 쓰로틀링용 타이머
    const timerDuration = 200   // 쓰로틀링 시간

    // 윈도우 스크롤 시
    $(window).on('scroll', function() {
        // 쓰로틀링(200ms 동안 실행 차단)
        if(footerTimer) return;

        // 200ms가 지나면
        timer = setTimeout(() => {
            // 페이지가 하단까지 도달했는지
            const isBottom = $(window).scrollTop() + $(window).height() >= $(document).height() - 5;

            // 하단까지 도달했고 활성화 기능이 실행이 되지 않았다면
            if(isBottom && !isFooterActive) {
                // 모든 네비게이션 메뉴의 on 클래스를 제거하고
                $navMenus.removeClass('on');

                // #footer를 href 값으로 가진 a요소의 부모 요소(li)에 on 클래스 추가
                $('#navList > li > a[href="#footer"]').addClass('on');

                // 상태를 실행으로 변경
                isFooterActive = true;
            }
            // 하단까지 도달하지 않았다면 상태를 미실행으로 변경
            else if(!isBottom) isFooterActive = false;
        }, timerDuration);
    });

    // --------------------------

    // 네비게이션 메뉴 클릭 시 해당 페이지로 스크롤

    // 변수 선언    
    const $navLinks = $('#navList > li > a');   // 네비게이션 메뉴 링크
    const scrollDuration = 300                  // 스크롤 속도

    // 네비게이션 메뉴 링크 클릭 시
    $navLinks.on('click keydown', function(event) {
        // 클릭 이벤트거나 엔터를 누르거나 스페이스 바를 누르면
        if (event.type === 'click' || event.which === 13 || event.which === 32) {
            // 기본 이벤트 및 이벤트 전달 제거
            event.preventDefault();
            event.stopPropagation();

            // 관찰자 잠금
            isScrolling = true;
            
            // 변수 선언
            const targetId = $(this).attr('href'); // 이동할 id
            const targetOffset = $(targetId).offset().top; // 섹션 위치 계산

            // 클릭한 링크에만 on 클래스 설정
            $(this).addClass('on').parent('li').siblings().children('a').removeClass('on');

            // 부드럽게 이동
            $('html, body').animate({ scrollTop: targetOffset }, scrollDuration, function() {
                // 이동이 끝난 후 관찰자 잠금 해제
                isScrolling = false;
            });
        }
    });

    // --------------------------

    // 홈 화면 타이틀
    
    // 변수 선언
    const $homeTitle = $('#homeTitle');     // 타이틀
    const originText = $homeTitle.text();   // 타이틀의 텍스트 저장
    const $titleArrow = $('#home > img');   // 화살표
    const titleDuration = 300               // 밑줄 애니메이션 진행 시간
    const arrowDuration = 500               // 화살표 애니메이션 진행 시간
    
    // 타이틀 밑줄 나타내기
    $homeTitle.addClass('on');

    // 타자 효과를 나타내기 전 글자 비우기
    $homeTitle.text('');

    // 타이틀 밑줄이 나타난 후
    setTimeout(() => {
        // 타이핑 옵션 설정
        const options = {
            strings: [originText],  // 타자를 칠 내용
            typeSpeed: 50,          // 타이핑 속도
            startDelay: 0,          // 시작 대기 시간
            loop: false,            // 반복 여부
            showCursor: false,      // 커서 표시 여부
            onComplete: function(self) {
                setInterval(() => {
                    $titleArrow.addClass('move');
                    setTimeout(() => {$titleArrow.removeClass('move')}, arrowDuration);
                }, arrowDuration * 2);
            }
        };
        // 타자기 실행
        const typed = new Typed('#homeTitle', options);
    }, titleDuration);

    // --------------------------

    // About Me 아코디언 메뉴

    // 변수 선언
    const $competencyMenu = $('.competencyTitle'); // 핵심 역량 메뉴
    const $competencyContent = $('.competencyContent');         // 핵심 역량 내용
    const accordionDuration = 300                               // 애니메이션 진행 시간

    // 핵심 역량 메뉴 클릭 시
    $competencyMenu.on('click keydown', function(event) {
        // body의 클릭 이벤트 방지
        event.stopPropagation();

        // 핵심 역량 내용이 애니메이션 중이라면 함수를 종료
        if($competencyContent.is(':animated')) return;

        // 클릭 이벤트거나 엔터를 누르거나 스페이스 바를 누르면
        if(event.type === 'click' || event.which == 13 || event.which === 32) {
            // 스페이스바를 누를 때 페이지가 아래로 스크롤되는 기본 동작 방지
            if (event.which === 32) { event.preventDefault(); }

            // 클릭한 메뉴의 내용이 열려있다면 닫기
            if($(this).hasClass('on')) $(this).removeClass('on').next().slideUp(accordionDuration);
            // 그렇지 않다면 다른 메뉴의 내용을 닫고 클릭한 메뉴의 내용을 열기
            else {
                $competencyMenu.removeClass('on').next().slideUp(accordionDuration);
                $(this).addClass('on').next().slideDown(accordionDuration);
            }
        }
    });

    // 핵심 역량 메뉴를 제외한 다른 곳 클릭 시 메뉴 닫기
    $('body').on('click', function() {
        $competencyMenu.removeClass('on');
        $competencyContent.slideUp(accordionDuration);
    });

    // --------------------------

    // 웹 작업물
    
    // 변수선언
    const $webWorks = $('#works > ul > li');                                // 웹 작업물 항목
    const $webShortcut = $('#works > ul > li > div > div:last-child > a');  // 바로가기

    // IntersectionObserver(특정 요소가 보이면 알려줌) 생성
    const webObserver = new IntersectionObserver((entries, observer) => {
        // 감시 중인 요소들 중 상태가 바뀐 요소들을 하나씩 확인
        entries.forEach((entry) => {
            // 감시 중인 요소가 화면에 들어왔다면
            if (entry.isIntersecting) {
                // 애니메이션 상태를 나타내는 클래스만 추가
                $(entry.target).addClass('active');
                // 애니메이션이 한 번만 실행되도록 감시 중지
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 }); // 요소가 20% 보일때 실행

    // 요소에 옵저버 연결
    $webWorks.each(function() { webObserver.observe(this); });

    // 바로가기 클릭 이벤트
    $webShortcut.on('click keydown', function(event) {
            // 스페이스바를 누를 때 페이지가 아래로 스크롤되는 기본 동작 방지, 설정한 링크로 이동
            if (event.which === 32) {
                event.preventDefault();
                this.click();
            }
    })

    // --------------------------

    // 이미지 오버레이

    // 스크롤 방지 로직 (모든 이벤트 차단)
    const preventScroll = (event) => { event.preventDefault(); };

    // 스크롤 잠금 함수
    function disableScroll() {
        window.addEventListener('wheel', preventScroll, { passive: false });
        window.addEventListener('touchmove', preventScroll, { passive: false });
        window.addEventListener('keydown', preventScroll, { passive: false });
    }

    // 스크롤 잠금 해제 함수
    function enableScroll() {
        window.removeEventListener('wheel', preventScroll, { passive: false });
        window.removeEventListener('touchmove', preventScroll, { passive: false });
        window.removeEventListener('keydown', preventScroll, { passive: false });
    }

    // 변수 선언
    const $image = $('.designContainer img');               // 작업물 이미지
    const $imageOverlay = $('#imageOverlay');               // 오버레이
    const $imageContainer = $('#imageOverlay > div');       // 오버레이 이미지 컨테이너
    const $overlayImage = $('#imageOverlay > div > img');   // 오버레이 이미지
    const $closeButton = $('#imageOverlay > button');       // 닫기 버튼
    const fadeDuration = 300                                // 페이드 애니메이션 진행시간

    // 작업물 이미지를 클릭하면
    $image.on('click keydown', function(event) {
        // 클릭 이벤트거나 엔터를 누르거나 스페이스 바를 누르면
        if(event.type === 'click' || event.which == 13 || event.which === 32) {
            // 스페이스바를 누를 때 페이지가 아래로 스크롤되는 기본 동작 방지
            if (event.which === 32) { event.preventDefault(); }

            // 클릭한 이미지의 data-src 속성값을 변수에 저장
            const dataSrc = $(this).attr('data-src');
    
            // 오버레이 이미지의 src를 dataSrc로 변경
            $overlayImage.attr('src', dataSrc);
    
            // 오버레이를 표시하고 그 후에 오버레이 이미지를 표시
            $imageOverlay.fadeIn(fadeDuration, () => { $overlayImage.fadeIn(fadeDuration); });

            // 닫기 버튼에 포커싱
            $closeButton.focus();
    
            // 스크롤 잠금
            disableScroll();
        }
    });

    // 오버레이를 클릭하면
    $imageOverlay.on('click keydown', function() {
        // 클릭 이벤트거나 엔터를 누르거나 스페이스 바를 누르면
        if(event.type === 'click' || event.which == 13 || event.which === 32) {
            // 키보드 이벤트의 잠금을 풀어서 닫힐 수 있도록
            window.removeEventListener('keydown', preventScroll, { passive: false });
        }

        // 오버레이 이미지를 없앤 후 오버레이를 없앰
        $overlayImage.fadeOut(fadeDuration, () => { $(this).fadeOut(fadeDuration); });

        // 스크롤 잠금 해제
        enableScroll();
    });

    // 오버레이 이미지 이벤트
    $overlayImage.on({
        // $imageOverlay 클릭 이벤트 방지(오버레이 영역만 눌러지게)
        click: (event) => { event.stopPropagation(); },
        // 해당 요소 안에서 마우스를 움직이면
        mousemove: function(event) {
            // 현재 이미지 요소의 전체 너비, 높이를 저장
            const width = $(this).outerWidth();
            const height = $(this).outerHeight();

            // 마우스 커서의 위치를 이미지 내부의 좌측 상단 기준(0,0) 좌표로 가져옴
            const x = event.offsetX;
            const y = event.offsetY;

            // 마우스 X 좌표를 -1.0 ~ 1.0 범위의 값으로 변환, 20을 곱해 -20도 ~ +20도 회전값 설정
            // (x / width)는 0 ~ 1 사이의 비율, 0.5를 빼면 -0.5 ~ 0.5가 됨
            const moveX = (x / width - 0.5) * 20;

            // 마우스 Y 좌표를 기준으로 회전값 계산
            // 마우스가 아래로 내려갈 때 이미지가 눌리는 느낌을 주기 위해 -20을 곱함
            const moveY = (y / height - 0.5) * -20;

            // 계산된 각도를 css에 적용
            $(this).css({ 'transform': `rotateY(${moveX}deg) rotateX(${moveY}deg)` });
        },
        // 해당 요소에서 마우스가 떠나면 원래대로 복구
        mouseleave: function() { $(this).css('transform', 'rotateY(0deg) rotateX(0deg)'); }
    });
});
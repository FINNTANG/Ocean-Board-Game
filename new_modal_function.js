// 新的极端条件弹窗函数

// 自定义游戏极端条件弹窗
function showGameOverModal() {
    const gameContainer = document.getElementById('game-container');
    // 移除已有modal
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) gameContainer.removeChild(existingModal);

    // 创建modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.position = 'fixed';
    modalOverlay.style.inset = '0';
    modalOverlay.style.display = 'flex';
    modalOverlay.style.alignItems = 'center';
    modalOverlay.style.justifyContent = 'center';
    modalOverlay.style.zIndex = '100';
    modalOverlay.style.background = 'rgba(17, 24, 39, 0.7)';
    modalOverlay.style.backdropFilter = 'blur(8px)';
    modalOverlay.style.transition = 'all 0.6s cubic-bezier(0.4,0,0.2,1)';
    modalOverlay.style.opacity = '0';

    // modal内容
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.maxWidth = '30rem';
    modalContent.style.width = '90%';
    modalContent.style.margin = '0 1rem';
    modalContent.style.textAlign = 'center';
    modalContent.style.padding = '3rem 2.5rem';
    modalContent.style.borderRadius = '1.5rem';
    modalContent.style.background = 'white';
    modalContent.style.boxShadow = '0 25px 50px -12px rgba(0,0,0,0.5)';
    modalContent.style.display = 'flex';
    modalContent.style.flexDirection = 'column';
    modalContent.style.alignItems = 'center';
    modalContent.style.gap = '1.5rem';
    modalContent.style.transform = 'scale(0.92) translateY(30px)';
    modalContent.style.opacity = '0';
    modalContent.style.transition = 'all 0.5s cubic-bezier(0.4,0,0.2,1)';
    modalContent.style.border = '2px solid rgba(59,130,246,0.15)';

    // 图标
    const icon = document.createElement('div');
    icon.style.fontSize = '4rem';
    icon.style.marginBottom = '0.5rem';
    icon.style.color = '#3B82F6';
    icon.textContent = '🌊';

    // 标题
    const title = document.createElement('h2');
    title.textContent = 'Your city is facing extreme conditions';
    title.style.color = '#2563EB';
    title.style.fontWeight = '700';
    title.style.fontSize = '1.75rem';
    title.style.margin = '0';
    title.style.lineHeight = '1.4';

    // 内容
    const desc = document.createElement('p');
    desc.textContent = 'One of your stance values has reached an extreme level of 100%. How would you like to proceed?';
    desc.style.color = '#4B5563';
    desc.style.fontSize = '1.1rem';
    desc.style.margin = '0';
    desc.style.lineHeight = '1.6';

    // 按钮容器
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.flexDirection = 'column';
    buttonContainer.style.gap = '1rem';
    buttonContainer.style.width = '100%';
    buttonContainer.style.marginTop = '1rem';

    // 继续游戏按钮
    const continueBtn = document.createElement('button');
    continueBtn.className = 'btn btn-primary btn-large';
    continueBtn.textContent = 'Continue with Reset Values';
    continueBtn.style.width = '100%';
    continueBtn.style.padding = '1rem';
    continueBtn.style.transition = 'all 0.3s ease';
    continueBtn.addEventListener('mouseover', () => {
        continueBtn.style.transform = 'scale(1.05)';
        continueBtn.style.boxShadow = '0 4px 12px 0 rgba(59,130,246,0.15)';
    });
    continueBtn.addEventListener('mouseout', () => {
        continueBtn.style.transform = 'scale(1)';
        continueBtn.style.boxShadow = 'none';
    });
    continueBtn.addEventListener('mousedown', () => {
        continueBtn.style.transform = 'scale(0.97)';
    });
    continueBtn.addEventListener('mouseup', () => {
        continueBtn.style.transform = 'scale(1.05)';
    });
    continueBtn.addEventListener('click', () => {
        gameState.gameMetrics.industrialStance = 0;
        gameState.gameMetrics.ecologicalStance = 0;
        gameContainer.removeChild(modalOverlay);
        renderScreen('main-game');
    });

    // 重新开始按钮
    const restartBtn = document.createElement('button');
    restartBtn.className = 'btn btn-outline btn-medium';
    restartBtn.textContent = 'Restart Game';
    restartBtn.style.width = '100%';
    restartBtn.style.padding = '1rem';
    restartBtn.style.backgroundColor = 'transparent';
    restartBtn.style.color = '#3B82F6';
    restartBtn.style.border = '2px solid #3B82F6';
    restartBtn.style.transition = 'all 0.3s ease';
    restartBtn.addEventListener('mouseover', () => {
        restartBtn.style.backgroundColor = '#EFF6FF';
        restartBtn.style.transform = 'scale(1.05)';
        restartBtn.style.boxShadow = '0 4px 12px 0 rgba(59,130,246,0.1)';
    });
    restartBtn.addEventListener('mouseout', () => {
        restartBtn.style.backgroundColor = 'transparent';
        restartBtn.style.transform = 'scale(1)';
        restartBtn.style.boxShadow = 'none';
    });
    restartBtn.addEventListener('mousedown', () => {
        restartBtn.style.transform = 'scale(0.97)';
    });
    restartBtn.addEventListener('mouseup', () => {
        restartBtn.style.transform = 'scale(1.05)';
    });
    restartBtn.addEventListener('click', () => {
        // 完全重置游戏状态
        window.location.reload();
    });

    buttonContainer.appendChild(continueBtn);
    buttonContainer.appendChild(restartBtn);
    
    modalContent.appendChild(icon);
    modalContent.appendChild(title);
    modalContent.appendChild(desc);
    modalContent.appendChild(buttonContainer);
    modalOverlay.appendChild(modalContent);
    gameContainer.appendChild(modalOverlay);

    // 动画淡入
    setTimeout(() => {
        modalOverlay.style.opacity = '1';
        modalContent.style.opacity = '1';
        modalContent.style.transform = 'scale(1) translateY(0)';
    }, 30);
}

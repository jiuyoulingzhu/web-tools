document.getElementById('groupForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const domain = document.getElementById('domain').value;
  const groupName = document.getElementById('groupName').value;
  const color = document.getElementById('color').value;

  chrome.storage.sync.set({ [domain]: { groupName, color } }, function() {
    document.getElementById('status').textContent = '保存成功';
    setTimeout(() => {
      window.close();
    }, 1000);
  });
});

document.getElementById('showConfigButton').addEventListener('click', function() {
  const modal = document.getElementById('configModal');
  const configList = document.getElementById('configList');
  const itemsPerPage = 3;
  let currentPage = 1;
  let totalPages = 1;

  const colorMap = {
    blue: '#0000FF',
    red: '#FF0000',
    grey: '#808080',
    yellow: '#FFFF00',
    green: '#008000',
    pink: '#FFC0CB',
    purple: '#800080',
    cyan: '#00FFFF',
    orange: '#FFA500'
  };

  function renderPage(items, page) {
    configList.innerHTML = '';
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = items.slice(start, end);

    for (const [domain, config] of pageItems) {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${domain}</td><td>${config.groupName}</td><td><div class="color-box" style="background-color: ${colorMap[config.color]};"></div></td>`;
      configList.appendChild(row);
    }

    document.getElementById('currentPage').textContent = page;
    updatePaginationButtons(page);
  }

  function updatePaginationButtons(page) {
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');

    prevButton.classList.toggle('disabled', page === 1);
    nextButton.classList.toggle('disabled', page === totalPages);

    // 如果当前页大于 1，启用上一页按钮
    if (currentPage > 1) {
      prevButton.disabled = false;
      prevButton.style.backgroundColor = '#4db8ff'; // 设置颜色为蓝色
    } else {
      prevButton.disabled = true;
      prevButton.style.backgroundColor = ''; // 恢复默认颜色
    }

    // 如果当前页小于总页数，启用下一页按钮
    if (currentPage < totalPages) {
      nextButton.disabled = false;
      nextButton.style.backgroundColor = '#4db8ff'; // 设置颜色为蓝色
    } else {
      nextButton.disabled = true;
      nextButton.style.backgroundColor = ''; // 恢复默认颜色
    }
  }

  function renderPagination(totalItems) {
    totalPages = Math.ceil(totalItems / itemsPerPage);
    updatePaginationButtons(currentPage);
  }

  chrome.storage.sync.get(null, function(items) {
    if (items) {
      const entries = Object.entries(items);
      renderPagination(entries.length);
      renderPage(entries, currentPage);
    } else {
      console.error('No items found in storage.');
    }
  });

  modal.style.display = 'block';

  // 关闭弹框
  document.querySelector('.close').onclick = function() {
    modal.style.display = 'none';
  };

  window.onclick = function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };

  document.getElementById('prevPage').addEventListener('click', function() {
    if (currentPage > 1) {
      currentPage--;
      chrome.storage.sync.get(null, function(items) {
        if (items) {
          renderPage(Object.entries(items), currentPage);
        }
      });
    }
  });

  document.getElementById('nextPage').addEventListener('click', function() {
    if (currentPage < totalPages) {
      currentPage++;
      chrome.storage.sync.get(null, function(items) {
        if (items) {
          renderPage(Object.entries(items), currentPage);
        }
      });
    }
  });
});
document.getElementById('searchButton').addEventListener('click', function () {
    const searchName = document.getElementById('nomeInput').value.trim();
    const searchDate = document.getElementById('dataNascInput').value.trim();

    if (searchName !== '') {
        showLoading();
        resetPage();
        searchInCSV(searchName, searchDate, function (results) {
            hideLoading();
            displaySearchResults(results, searchName);
        });
    } else {
        alert('Por favor, digite o nome do paciente no campo de busca');
    }
});

function resetPage() {
    document.getElementById('resultDiv').style.display = 'none';
    resetTable();
    resetPagination();
}

function resetTable() {
    const resultTableBody = document.getElementById('resultTableBody');
    resultTableBody.innerHTML = '';
}

function resetPagination() {
    const paginationElement = document.getElementById('pagination');
    paginationElement.innerHTML = '';
}

function showLoading() {
    const loadingElement = document.getElementById('loading');
    loadingElement.classList.remove('d-none'); // Remover classe 'd-none' para exibir o Spinner
}

function hideLoading() {
    const loadingElement = document.getElementById('loading');
    loadingElement.classList.add('d-none'); // Adicionar classe 'd-none' para ocultar o Spinner
}

function searchInCSV(name, date, callback) {
    const filePath = 'db/prontuario.csv';
    Papa.parse(filePath, {
        download: true,
        delimiter: ',',
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            const data = results.data;
            const matchingRows = data.filter(row => {
                const nameMatch = row['nome'] && row['nome'].toLowerCase().includes(name.toLowerCase());
                const dateMatch = !date || (row['data_nasc'] && row['data_nasc'].includes(date));
                return nameMatch && dateMatch;
            });
            callback(matchingRows);
        },
        error: function (error) {
            console.error(error);
            displayErrorPage();
        }
    });
}

function getNumberOfResults(data, searchName, searchDate) {
    const matchingRows = data.filter(row => {
        const nameMatch = row['nome'] && row['nome'].toLowerCase().includes(searchName.toLowerCase());
        const dateMatch = !searchDate || (row['data_nasc'] && row['data_nasc'].includes(searchDate));
        return nameMatch && dateMatch;
    });
    return matchingRows.length;
}

function displaySearchResults(data, searchName, currentPage = 1) {
    const resultTableBody = document.getElementById('resultTableBody');
    resultTableBody.innerHTML = '';

    const itemsPerPage = 10;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const matchingRows = data.slice(startIndex, endIndex);

    if (matchingRows.length === 0) {
        resultTableBody.innerHTML = `<tr><td colspan="4">Desculpe, mas não foi possível encontrar um resultado por "${searchName}". Tente novamente.</td></tr>`;
    } else {
        matchingRows.forEach((row, index) => {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${index + 1 + startIndex}</td>
                <td>${row['nome']}</td>
                <td>${row['data_nasc']}</td>
                <td><a href="${row['filePath']}" target="_blank"><i class="fa fa-file-pdf-o" style="font-size:24px; color:red"></i></a></td>
                <td><a href="whatsapp://send?text=Paciente%20${row['nome']}.%20Clique%20para%20acessar%20o%20laudo:%20${row['data_nasc']}" data-action="share/whatsapp/share" target="_blank"><i class="fa fa-send" style="font-size:24px; color:blue"></i></a></td>
            `; // Restante do código
            resultTableBody.appendChild(newRow);
        });
    }

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const paginationElement = document.getElementById('pagination');
    paginationElement.innerHTML = '';

    if (totalPages > 1) {
        paginationElement.style.display = 'block';

        const createPaginationLink = (page, label, active = false) => {
            const link = document.createElement('li');
            link.classList.add('page-item');
            if (active) link.classList.add('active');
            const linkContent = `<a class="page-link" href="#">${label}</a>`;
            link.innerHTML = linkContent;
            link.addEventListener('click', () => {
                displaySearchResults(data, searchName, page);
            });
            return link;
        };

        const prevLink = createPaginationLink(currentPage - 1, 'Anterior', currentPage === 1);
        const nextLink = createPaginationLink(currentPage + 1, 'Próximo', currentPage === totalPages);

        paginationElement.appendChild(prevLink);

        for (let i = 1; i <= totalPages; i++) {
            const pageLink = createPaginationLink(i, i, i === currentPage);
            paginationElement.appendChild(pageLink);
        }

        paginationElement.appendChild(nextLink);
    } else {
        paginationElement.style.display = 'none';
    }

    document.getElementById('resultDiv').style.display = 'block';
}

function displayErrorPage() {
    // Redirecionar para a página de erro
    window.location.href = '../index.html';
}

// Função para atualizar o contador regressivo a cada segundo
function updateCountdown() {
    const countdownElement = document.getElementById('countdown');
    const targetTime = new Date().getTime() + 15 * 60 * 1000; // 15 minutos em milissegundos

    function update() {
        const currentTime = new Date().getTime();
        const remainingTime = targetTime - currentTime;

        if (remainingTime <= 0) {
            // Redirecionar após 15 minutos
            alert('Tempo esgotado!');
            window.location.href = '../index.html';
        } else {
            const minutes = Math.floor(remainingTime / 60000);
            const seconds = Math.floor((remainingTime % 60000) / 1000);
            countdownElement.textContent = `Tempo restante: ${String(minutes).padStart(2, '0')}:${String(
                seconds
            ).padStart(2, '0')}`;
        }
    }

    update(); // Chamar a função para atualizar imediatamente
    setInterval(update, 1000); // Atualizar a cada segundo
}

updateCountdown(); // Chamar a função para iniciar o contador regressivo
document.getElementById('searchButton').addEventListener('click', function () {
    const searchValue = document.getElementById('searchInput').value.trim();
    if (searchValue !== '') {
        if (searchValue.split(' ').length === 1) {
            // Exibir o toast
             const toast = new bootstrap.Toast(document.getElementById('liveToast'));
             toast.show();
        } 
            showLoading(); // Exibir Spinner indicando busca em andamento
            resetPage(); // Limpar resultados anteriores da tabela
            searchInCSV(searchValue, function (results) {
                hideLoading(); // Esconder Spinner após a busca
                displaySearchResults(results, searchValue);
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

function searchInCSV(value, callback) {
    const filePath = 'db/sigamlaudos.csv'; // Substitua pelo caminho correto do arquivo CSV
    Papa.parse(filePath, {
        download: true,
        delimiter: ',',
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            displaySearchResults(results.data, value);
            displayNumberOfResults(getNumberOfResults(results.data, value), value);
            const data = results.data;
            const matchingRows = data.filter(row => row['content'] && row['content'].toLowerCase().includes(value.toLowerCase()));
            callback(matchingRows);
        },
        error: function (error) {
            console.error(error);
            exibirPaginaErro();
        }
    });
}

function displaySearchResults(data, value, currentPage = 1) {
    const resultTableBody = document.getElementById('resultTableBody');
    resultTableBody.innerHTML = '';

    const matchingRows = data.filter(row => row['content'] && row['content'].toLowerCase().includes(value.toLowerCase()));

    const itemsPerPage = 10;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRows = matchingRows.slice(startIndex, endIndex);

    if (currentRows.length === 0) {
        resultTableBody.innerHTML = `<tr><td colspan="4">Desculpe, mas não foi possível encontrar um resultado por "${value}". Tente novamente.</td></tr>`;
    } else {
        currentRows.forEach((row, index) => {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${index + 1 + startIndex}</td>
                <td>${row['content']}</td>
                <td><a href="${row['filePath']}" target="_blank"><i class="fa fa-file-pdf-o" style="font-size:24px; color:red"></i></a></td>
                <td><a href="whatsapp://send?text=Paciente%20${row['content']}.%20Clique%20para%20acessar%20o%20laudo:%20${row['filePath']}" data-action="share/whatsapp/share" target="_blank"><i class="fa fa-send" style="font-size:24px; color:blue"></i></a></td>
            `; /*<td><a href="${row['filePath']}" target="_blank"><button type="button" class="btn btn-secondary">Abrir <i class="fa fa-external-link" style="font-size:48px;color:red"></i></button></a></td>*/
            resultTableBody.appendChild(newRow);
        });
    }

    // Configuração da paginação
    const totalPages = Math.ceil(matchingRows.length / itemsPerPage);
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
                displaySearchResults(data, value, page);
            });
            return link;
        };

        const paginationLinks = [];
        const ellipsisLink = createPaginationLink(-1, '...');
        const prevLink = createPaginationLink(currentPage - 1, 'Anterior', currentPage === 1);
        //const currLink = createPaginationLink(currentPage + 1, '1', currentPage === 1);
        const nextLink = createPaginationLink(currentPage + 1, 'Próximo', currentPage === totalPages);

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                paginationLinks.push(createPaginationLink(i, i, i === currentPage));
            }
        } else {
            const rangeStart = Math.max(2, currentPage - 2);
            const rangeEnd = Math.min(totalPages - 1, currentPage + 2);

            if (rangeStart > 2) {
                paginationLinks.push(ellipsisLink.cloneNode(true));
            }

            for (let i = rangeStart; i <= rangeEnd; i++) {
                paginationLinks.push(createPaginationLink(i, i, i === currentPage));
            }

            if (rangeEnd < totalPages - 1) {
                paginationLinks.push(ellipsisLink.cloneNode(true));
            }
        }

        paginationElement.appendChild(prevLink);
        //paginationElement.appendChild(currLink);
        paginationLinks.forEach(link => paginationElement.appendChild(link));
        paginationElement.appendChild(nextLink);
    } else {
        paginationElement.style.display = 'none';
    }

    document.getElementById('resultDiv').style.display = 'block';
}

function getNumberOfResults(data, value) {
    const matchingRows = data.filter(row => row['content'] && row['content'].toLowerCase().includes(value.toLowerCase()));
    return matchingRows.length;
}

function displayNumberOfResults(numResults, value) {
    const resultStats = document.getElementById('resultStats');
    if (numResults === 1) {
        resultStats.textContent = `Foi encontrado 1 resultado na busca por "${value}"`;
    } else if (numResults > 1) {
        resultStats.textContent = `Foram encontrados ${numResults} resultados na busca por "${value}"`;
    } else {
        resultStats.textContent = ''; // Não exibe nenhum texto quando não há resultados
    }

    // const resultRedPill = document.getElementById('return');
    // if (numResults === 1) {
    //     resultRedPill.textContent = `1`;
    // } else if (numResults > 1) {
    //     resultRedPill.textContent = `${numResults}`;
    // } else {
    //     resultRedPill.textContent = ''; // Não exibe nenhum texto quando não há resultados
    // }
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
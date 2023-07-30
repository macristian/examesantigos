document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault();
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    // Leitura do arquivo CSV
    Papa.parse("/examesantigos/db/auth.csv", {
        download: true,
        complete: function (results) {
            var data = results.data;
            var authenticated = false;

            for (var i = 1; i < data.length; i++) {  // Começando de 1 para pular o cabeçalho do CSV
                var login = data[i][0];
                var senha = data[i][1];

                if (username === login && password === senha) {
                    authenticated = true;
                    break;
                }
            }

            if (authenticated) {
                window.location.href = "/examesantigos";
            } else {
                document.getElementById("errorMessage").innerText = "Usuário ou senha inválidos. Entre em contato com o administrador.";
            }
        }
    });
});
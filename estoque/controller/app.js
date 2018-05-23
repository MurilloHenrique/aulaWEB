/*
 * Criamos o nosso modulo
 * Observe que estamos carregando os seguintes modulos externos:
 * angularUtils.directives.dirPagination: paginacao dos dados
 * ngRoute: controle de rotas
 * ngMessages: mensagens personalizadas nos formulários
 * ngCookies: leitura e gravação de Cookies
 * ngMask: criação de máscaras de entrada de dados
 * naif.base64: converte o upload do arquivo na base64
 * ngSanitize: remove código malicioso do HTML
 * ui-select: permite filtrar os dados no combo
 **/
var app = angular.module('estoqueApp', ['angularUtils.directives.dirPagination', 'ngRoute', 'ngMessages', 'ngCookies', 'ngMask', 'naif.base64', 'ngSanitize', 'ui.select'])
        //Define o roteamento de acordo com a URL informada pelo usuario
        //Dependendo da URL irá verificar se o usuario está logado
        .config(['$routeProvider', function ($routeProvider) {
                ''
                //Definindo qual view será aberta em cada rota da aplicação
                $routeProvider
                        .when('/menu', {
                            templateUrl: 'views/menu.html',
                            auth: function (usuarioLogado) {
                                return usuarioLogado;
                            }
                        })
                        .when('/login', {
                            templateUrl: 'views/login.html'

                        })
                        .when('/grupos', {
                            templateUrl: 'views/grupos.html',
                            auth: function (usuarioLogado) {
                                return usuarioLogado;
                            }
                        })
                        .when('/usuarios', {
                            templateUrl: 'views/usuarios.html',
                            auth: function (usuarioLogado) {
                                return usuarioLogado;
                            }
                        })
                        .when('/produtos', {
                            templateUrl: 'views/produtos.html',
                            auth: function (usuarioLogado) {
                                return usuarioLogado;
                            }
                        })
                        .when('/pedidos', {
                            templateUrl: 'views/pedidos.html',
                            auth: function (usuarioLogado) {
                                return usuarioLogado;
                            }
                        })
                        .when('/relgrupos', {
                            templateUrl: 'views/relgrupos.html',
                            auth: function (usuarioLogado) {
                                return usuarioLogado;
                            }
                        })
                        .when('/graficos', {
                            templateUrl: 'views/graficos.html',
                            auth: function (usuarioLogado) {
                                return usuarioLogado;
                            }
                        })
                        .otherwise({
                            redirectTo: '/login'
                        });
            }])
        //Verifica se o usuario está logado em cada mudança de rota (alteração da URL)
        .run(function ($rootScope, $location, $cookies) {
            $rootScope.$on('$routeChangeStart', function (ev, next, curr) {
                if (next.$$route) {
                    var user = $cookies.get('usuarioLogado');
                    var auth = next.$$route.auth;
                    if (auth && !auth(user)) {
                        $location.path('/');
                        console.info("Usuário não está logado!");
                    }
                }
            });
        });
app.controller('estoqueController',
        function ($scope, $http, $window, $rootScope, Configuracoes, $cookies) {
            /*
             * 
             * RESTFUL SERVICES
             * 
             **********************************************************/
            var urlBase = 'http://aulaweb.oo/estoque/api';
            /*********************************************************
             *              
             */
            $scope.Configuracoes = Configuracoes;
            //Se estiver no cookie, carregamos o usuario logado
            $scope.Configuracoes.nomeUsuario = $cookies.get('nomeUsuarioLogado');
            //variaveis para a paginacao
            $scope.currentPage = 1;
            $scope.pageSize = 5;
            //direciona para o menu inicial
            $scope.menu = function () {
                window.location = "#/menu";
            };
            /* Utilizado para exibir as informaçoes sobre a requisição ao Servidor */
            $scope.requisicaoServidor = {
                aguarde: false
            };
            //Função para imprimir uma determinada DIV da página HTML
            $scope.imprimeDiv = function (nomeDIV, nomeTitulo) {
                var printContents = document.getElementById(nomeDIV).innerHTML;
                var popupWin = window.open('', '_blank', 'width=1024,height=768');
                popupWin.document.open();
                popupWin.document.write('<html><head><title>Relatorio</title><link rel="stylesheet" type="text/css" href="css/bootstrap.min.css"/></head>' +
                        '<body onload="window.print()"><img src="img/logo.jpg"><h1>Sistema de Controle de Estoque</h1><h2>' + nomeTitulo + '</h2>' + printContents + '</html>');
                popupWin.document.close();
            };
            /*
             * LOGIN
             * 
             */
            //funcao para validar o login
            $scope.validaLogin = function (login) {
                $http.get(urlBase + "/login/" + login.usuario + "/" + login.senha)
                        .success(function (data) {
                            if (data == 'true') {
                                var urlInicial = "http://" + $window.location.host + "/estoque/#/menu";
                                $window.location.href = urlInicial;
                                $window.location;
                                $rootScope.usuarioLogado = true;
                                // Armazena o Cookie
                                var nomeUsuario = login.usuario.toUpperCase();
                                var dataExpiracao = new Date();
                                //Definimos que o usuario poderá ficar logado no maximo 30 minutos
                                dataExpiracao.setMinutes(dataExpiracao.getMinutes() + 30);
                                Configuracoes.nomeUsuario = nomeUsuario;
                                //Salvamos em um cookie
                                $cookies.put('nomeUsuarioLogado', nomeUsuario, {'expires': dataExpiracao});
                                $cookies.put('usuarioLogado', 'true', {'expires': dataExpiracao});
                            } else {
                                BootstrapDialog.alert({
                                    title: 'ATENÇÃO!',
                                    message: 'O usuário e/ou a senha informados são inválidos!',
                                    type: BootstrapDialog.TYPE_WARNING, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                                    closable: true, // <-- Valor default é false          
                                    buttonLabel: 'Fechar' // <-- Valor default é 'OK'
                                });
                                $scope.login = {};
                                $rootScope.usuarioLogado = false;
                                $scope.Configuracoes.nomeUsuario = "";
                            }
                        })
                        .error(function () {
                            console.log('Erro ao tentar validar a senha');
                            BootstrapDialog.alert({
                                title: 'ATENÇÃO!',
                                message: 'Não foi possível validar a senha no WebService. Verifique se o endereço e/ou a porta informada estão corretos!',
                                type: BootstrapDialog.TYPE_WARNING, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                                closable: true, // <-- Valor default é false          
                                buttonLabel: 'Fechar' // <-- Valor default é 'OK'
                            });
                        });
            };
            //funcao para efetuar o logout
            $scope.logout = function () {
                $cookies.remove('nomeUsuarioLogado');
                $cookies.remove('usuarioLogado');
                Configuracoes.nomeUsuario = '';
            };
            //funcao para verificar se a senha e a confirmacao sao iguais
            $scope.validaSenha = function () {
                alert($scope.formUsuario.senha.toString());
                alert($scope.formUsuario.confirmacao.toString());
                $scope.formUsuario.confirmacao.$invalid = (1 === 1) ? false : true;
            };
            /*========================================================
             * GRUPOS
             ========================================================*/
            $scope.grupo = {status: true}; //inicializamos o grupo com valor default true no status
            //Limpa o status touched dos campos do formulario
            $scope.limpaGrupo = function (nomeForm) {
                nomeForm.descricao.$touched = false;
            };
            //limpa o array do Grupo (utilizado quando o usuario cancela a inclusao ou edicao)
            $scope.limpaArrayGrupo = function () {
                $scope.grupo = {status: true};
            };
            // Carregando os grupos no array
            $scope.carregaGrupos = function () {
                getGrupos(); // Carrega todos os grupos    
            };
            // Carrega os dados do grupo pelo Id para a edição
            $scope.obtemGrupoPeloId = function (grupo) {
                $http.get(urlBase + "/grupos/" + grupo.id)
                        .success(function (data) {
                            $scope.grupo = data[0];
                        })
                        .error(function () {
                            console.log('Erro ao obter os dados do grupo');
                            $scope.grupo = "ERRO ao efetuar o SELECT!";
                        });
            };
            // Exibe caixa de diálogo para a exclusão
            $scope.confirmaExclusaoGrupo = function (grupo) {
                $scope.requisicaoServidor = {aguarde: true};
                var dialog = new BootstrapDialog.show({
                    title: 'Confirmação da Exclusão',
                    message: 'Atenção! Confirma a exclusão do grupo <strong>' + grupo.nome + '</strong>?<br> Esta operação não poderá ser desfeita!',
                    buttons: [{
                            icon: 'glyphicon glyphicon-ban-circle',
                            label: '(N)ão',
                            cssClass: 'btn-info',
                            hotkey: 78, // Código da tecla para o N (ASCII=78)
                            action: function () {
                                dialog.close();
                            }
                        }, {
                            icon: 'glyphicon glyphicon-ok-circle',
                            label: '(S)im',
                            cssClass: 'btn-danger',
                            hotkey: 83, // Código da tecla para o S (ASCII=83)
                            action: function () {
                                apagaGrupo(grupo.id);
                                dialog.close();
                            }
                        }
                    ]
                });
                $scope.requisicaoServidor = {aguarde: false};
            };
            // Função para salvar (insert ou update) os dados do grupo
            $scope.salvaGrupo = function (grupo) {
                $scope.requisicaoServidor = {aguarde: true};
                if (grupo.id === undefined) {
                    grupo.id = 0;
                }
                //inicialmente chamamos o verbo get/descricao para verificar se a descricao já existe no SGBD
                $http.get(urlBase + "/grupos/nome/" + grupo.nome + "/" + grupo.id).success(function (data) {
                    if (data != 0) { //Se o array retornou algo, é que existem registros
                        BootstrapDialog.alert({
                            title: 'ATENÇÃO!',
                            message: 'A descrição do grupo <strong>' + grupo.nome + '</strong> já existe no banco de dados!<br>Altere a descrição e tente salvar novamente.',
                            type: BootstrapDialog.TYPE_WARNING, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                            closable: true, // <-- Valor default é false          
                            buttonLabel: 'Fechar' // <-- Valor default é 'OK'
                        });
                    } else {//se a descrição está ok, iremos persistir o dado
                        $http.post(urlBase + "/grupos", grupo).success(function (data) {
                            console.info(JSON.stringify("Grupo salvo com sucesso!: " + data));
                            getGrupos();
                        }).error(function (error) {
                            console.error(JSON.stringify("Erro ao incluir o grupo: " + error));
                            BootstrapDialog.alert({
                                title: 'ATENÇÃO!',
                                message: 'Erro ao salvar o grupo:' + error,
                                type: BootstrapDialog.TYPE_DANGER, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                                closable: true, // <-- Valor default é false          
                                buttonLabel: 'Fechar' // <-- Valor default é 'OK'
                            });
                        });
                        $scope.grupo = {status: true};
                        BootstrapDialog.alert({
                            title: 'Processo efetuado com sucesso!',
                            message: 'O registro foi armazenado com sucesso no banco de dados.',
                            type: BootstrapDialog.TYPE_SUCCESS, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                            closable: true, // <-- Valor default é false
                            buttonLabel: 'Fechar' // <-- Valor default é 'OK'                                
                        });
                    }
                });
                $scope.requisicaoServidor = {aguarde: false};
            };
            function getGrupos() {
                $http.get(urlBase + "/grupos")
                        .success(function (data) {
                            $scope.grupos = data;
                        })
                        .error(function () {
                            console.log('Erro ao obter os dados do grupo');
                            $scope.grupos = "ERRO ao efetuar o SELECT!";
                        });
            }
            ;
            function apagaGrupo(codigo) {
                //inicialmente chamamos o verbo get/relacionado para verificar se o registro está vinculado com outra tabela
                $http.get(urlBase + "/grupos/relacionado/" + codigo).success(function (data) {
                    if (data != 0) { //Se o array retornou diferente de zero, é que existem registros
                        BootstrapDialog.alert({
                            title: 'ATENÇÃO!',
                            message: 'O grupo infelizmente NÃO PODE ser excluído, pois está vinculado a ' + data + ' produto(s)!',
                            type: BootstrapDialog.TYPE_WARNING, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                            closable: true, // <-- Valor default é false          
                            buttonLabel: 'Fechar' // <-- Valor default é 'OK'
                        });
                    } else { //caso contrario, providenciamos a exclusão.
                        $http.delete(urlBase + "/grupos/" + codigo).success(function (data) {
                            if (data != 1) {
                                BootstrapDialog.alert({
                                    title: 'ATENÇÃO!',
                                    message: 'Erro ao APAGAR o grupo:' + data,
                                    type: BootstrapDialog.TYPE_DANGER, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                                    closable: true, // <-- Valor default é false          
                                    buttonLabel: 'Fechar' // <-- Valor default é 'OK'
                                });
                            } else {
                                console.info("Grupo ID " + codigo + " removido com sucesso!");
                                BootstrapDialog.alert({
                                    title: 'Exclusão efetuada com sucesso!',
                                    message: 'O registro foi excluído com sucesso do banco de dados.',
                                    type: BootstrapDialog.TYPE_SUCCESS, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                                    closable: true, // <-- Valor default é false
                                    buttonLabel: 'Fechar' // <-- Valor default é 'OK'                                
                                });
                            }
                            ;
                            getGrupos();
                        });
                    }
                });
            }
            ;
            /*========================================================
             * FIM das Funções relacionados aos GRUPOS
             ========================================================*/

            /*========================================================
             * PRODUTOS
             ========================================================*/
            $scope.produto = {status: true};
            // Carregando os produtos no array
            //Limpa o status touched dos campos do formulario
            $scope.limpaProduto = function (nomeForm) {
                nomeForm.nome.$touched = false;
                nomeForm.preco.$touched = false;
                nomeForm.foto.$touched = false;
                nomeForm.codigobarra.$touched = false;
                nomeForm.grupo.$touched = false;
            };
            //limpa o array do Produto (utilizado quando o usuario cancela a inclusao ou edicao)
            $scope.limpaArrayProduto = function () {
                $scope.produto = {status: true};
            };
            $scope.limpaFotoProduto = function (foto) {
                foto = {
                    base64: '',
                    filename: '',
                    filesize: '',
                    filetype: ''
                };
                //limpar o arquivo selecionado no input type="file"
                var control = $("#fotoproduto");
                control.replaceWith(control = control.clone(true));
            };
            $scope.carregaProdutos = function () {
                getProdutos(); // Carrega todos os produtos    
            };
            //Carrega os dados para exibir no grafico
            $scope.carregaGraficoProdutos = function () {
                getGraficoProdutos(); // Carrega todos os dados do grafico    
            };
            // Carrega os dados do produto pelo Id para a edição
            $scope.obtemProdutoPeloId = function (produto) {
                $http.get(urlBase + "/produtos/" + produto.id)
                        .success(function (data) {
                            $scope.produto = data[0];
                            $scope.produto.validade = new Date(data[0].validade);
                            $scope.produto.grupo = {id: data[0].id_grupo};
                        })
                        .error(function () {
                            console.log('Erro ao obter os dados do produto');
                            $scope.produto = "ERRO ao efetuar o SELECT!";
                        });
            };
            // Exibe caixa de diálogo para a exclusão
            $scope.confirmaExclusaoProduto = function (produto) {
                $scope.requisicaoServidor = {aguarde: true};
                var dialog = new BootstrapDialog.show({
                    title: 'Confirmação da Exclusão',
                    message: 'Atenção! Confirma a exclusão do produto ' + produto.nome + '? Esta operação não poderá ser desfeita!',
                    buttons: [{
                            icon: 'glyphicon glyphicon-ban-circle',
                            label: '(N)ão',
                            cssClass: 'btn-info',
                            hotkey: 78, // Código da tecla para o N (ASCII=78)
                            action: function () {
                                dialog.close();
                            }
                        }, {
                            icon: 'glyphicon glyphicon-ok-circle',
                            label: '(S)im',
                            cssClass: 'btn-danger',
                            hotkey: 83, // Código da tecla para o S (ASCII=83)
                            action: function () {
                                apagaProduto(produto.id);
                                dialog.close();
                            }
                        }
                    ]
                });
                $scope.requisicaoServidor = {aguarde: false};
            };
            // Função para salvar (insert ou update) os dados do produto
            $scope.salvaProduto = function (produto) {
                produto.validade = new Date(produto.validade).toISOString().slice(0, 10);
                $scope.requisicaoServidor = {aguarde: true};
                if (produto.id === undefined) {
                    produto.id = 0;
                }
                //inicialmente chamamos o verbo get/descricao para verificar se a descricao já existe no SGBD
                $http.get(urlBase + "/produtos/nome/" + produto.nome + "/" + produto.id).success(function (data) {
                    if (data != 0) { //Se o array retornou algo, é que existem registros
                        BootstrapDialog.alert({
                            title: 'ATENÇÃO!',
                            message: 'A descrição do produto <strong>' + produto.nome + '</strong> já existe no banco de dados!<br>Altere a descrição e tente salvar novamente.',
                            type: BootstrapDialog.TYPE_WARNING, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                            closable: true, // <-- Valor default é false          
                            buttonLabel: 'Fechar' // <-- Valor default é 'OK'
                        });
                    } else {//se a descrição está ok, iremos persistir o dado
                        $http.post(urlBase + "/produtos", produto).success(function (data) {
                            console.info(JSON.stringify("Produto salvo com sucesso!: " + data));
                            getProdutos();
                        }).error(function (error) {
                            console.error(JSON.stringify("Erro ao incluir o produto: " + error));
                            BootstrapDialog.alert({
                                title: 'ATENÇÃO!',
                                message: 'Erro ao salvar o produto:' + error,
                                type: BootstrapDialog.TYPE_DANGER, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                                closable: true, // <-- Valor default é false          
                                buttonLabel: 'Fechar' // <-- Valor default é 'OK'
                            });
                        });
                        $scope.produto = {status: true};
                        BootstrapDialog.alert({
                            title: 'Processo efetuado com sucesso!',
                            message: 'O registro foi armazenado com sucesso no banco de dados.',
                            type: BootstrapDialog.TYPE_SUCCESS, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                            closable: true, // <-- Valor default é false
                            buttonLabel: 'Fechar' // <-- Valor default é 'OK'                                
                        });
                    }
                });
                $scope.requisicaoServidor = {aguarde: false};
            };
            function getProdutos() {
                $http.get(urlBase + "/produtos")
                        .success(function (data) {
                            $scope.produtos = data;
                        })
                        .error(function () {
                            console.log('Erro ao obter os dados do produto');
                            $scope.produtos = "ERRO ao efetuar o SELECT!";
                        });
            }
            ;
            function getGraficoProdutos() {
                $http.get(urlBase + "/grupos/graficos")
                        .success(function (data) {
                            $scope.graficoProdutos = data;
                            var descricaoGrafico = new Array();
                            var dadosGrafico = new Array();
                            angular.forEach($scope.graficoProdutos, function (valor, chave) {
                                descricaoGrafico.push(valor['nome']);
                                dadosGrafico.push(valor['qtde']);
                            });
                            $scope.descricaoGrafico = descricaoGrafico.join(',').replace(/,/g, '|').split().toString();
                            $scope.dadosGrafico = dadosGrafico.toString();
                        })



                        .error(function () {
                            console.log('Erro ao obter os dados do produto');
                            $scope.graficoProdutos = "ERRO ao efetuar o SELECT!";
                        });
            }
            ;
            function apagaProduto(codigo) {
                //providenciamos a exclusão.
                $http.delete(urlBase + "/produtos/" + codigo).success(function (data) {
                    if (data !== 1) {
                        BootstrapDialog.alert({
                            title: 'ATENÇÃO!',
                            message: 'Erro ao APAGAR o produto:' + data,
                            type: BootstrapDialog.TYPE_DANGER, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                            closable: true, // <-- Valor default é false          
                            buttonLabel: 'Fechar' // <-- Valor default é 'OK'
                        });
                    } else {
                        console.info("Produto ID " + codigo + " removido com sucesso!");
                        BootstrapDialog.alert({
                            title: 'Exclusão efetuada com sucesso!',
                            message: 'O registro foi excluído com sucesso do banco de dados.',
                            type: BootstrapDialog.TYPE_SUCCESS, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                            closable: true, // <-- Valor default é false
                            buttonLabel: 'Fechar' // <-- Valor default é 'OK'                                
                        });
                    }
                    ;
                    getProdutos();
                });
            }
            ;
            /*========================================================
             * FIM das Funções relacionados aos PRODUTOS
             ========================================================*/

            /*========================================================
             * USUARIOS
             ========================================================*/
            $scope.limpaFoto = function (foto) {
                foto = {
                    base64: '',
                    filename: '',
                    filesize: '',
                    filetype: ''
                };
                //limpar o arquivo selecionado no input type="file"
                var control = $("#fotousuario");
                control.replaceWith(control = control.clone(true));
            };
            $scope.usuario = {status: true, tipo: 'administrador'};
            //Limpa o status touched dos campos do formulario
            $scope.limpaUsuario = function (nomeForm) {
                nomeForm.login.$touched = false;
                nomeForm.nome.$touched = false;
                nomeForm.senha.$touched = false;
                nomeForm.foto.$touched = false;
                nomeForm.confirmacao = '';
            };
            //limpa o array do Usuario (utilizado quando o usuario cancela a inclusao ou edicao)
            $scope.limpaArrayUsuario = function () {
                $scope.usuario = {status: true, tipo: 'administrador'};
            };
            // Carregando os usuarios no array
            $scope.carregaUsuarios = function () {
                getUsuarios(); // Carrega todos os usuarios   

            };
            function getUsuarios() {
                $http.get(urlBase + "/usuarios")
                        .success(function (data) {
                            $scope.usuarios = data;
                        })
                        .error(function () {
                            console.log('Erro ao obter os dados do usuario');
                            $scope.usuarios = "ERRO ao efetuar o SELECT!";
                        });
            }
            ;
// Função para salvar os dados do usuario
            $scope.salvaUsuario = function (usuario) {
                $scope.requisicaoServidor = {aguarde: true};
                if (usuario.id === undefined) {
                    usuario.id = 0;
                }
                $http.post(urlBase + "/usuarios", usuario).success(function (data) {
                    console.info(JSON.stringify("Usuário salvo com sucesso!: " + data));
                    getUsuarios();
                }).error(function (error) {
                    console.error(JSON.stringify("Erro ao incluir o usuário: " + error));
                    BootstrapDialog.alert({
                        title: 'ATENÇÃO!',
                        message: 'Erro ao salvar o usuário:' + error,
                        type: BootstrapDialog.TYPE_DANGER, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                        closable: true, // <-- Valor default é false          
                        buttonLabel: 'Fechar' // <-- Valor default é 'OK'
                    });
                });
                BootstrapDialog.alert({
                    title: 'Processo efetuado com sucesso!',
                    message: 'O registro foi armazenado com sucesso no banco de dados.',
                    type: BootstrapDialog.TYPE_SUCCESS, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                    closable: true, // <-- Valor default é false
                    buttonLabel: 'Fechar' // <-- Valor default é 'OK'                                
                });
                $scope.requisicaoServidor = {aguarde: false};
            };
            /*========================================================
             * FIM das Funções relacionados aos USUARIOS
             ========================================================*/

            /*========================================================
             * CLIENTES
             ========================================================*/

            // Carregando os clientes no array
            $scope.carregaClientes = function () {
                getClientes(); // Carrega todos os pedidos    
            };
            function getClientes() {
                $http.get(urlBase + "/clientes")
                        .success(function (data) {
                            $scope.clientes = data;
                        })
                        .error(function () {
                            console.log('Erro ao obter os dados do cliente');
                        });
            }
            ;
            /*========================================================
             * FIM das Funções relacionados aos CLIENTES
             ========================================================*/


            /*========================================================
             * PEDIDOS
             ========================================================*/
            var hoje = new Date(); //para definir a data de emissão do pedido
            limpaArrayPedido();            
            
            //limpa o array do Pedido (utilizado quando o usuario cancela a inclusao ou edicao)
            function limpaArrayPedido() {
                $scope.pedido = {situacao: 'Aberto', dataCriacao: hoje};
            };
            
            $scope.limpaArrayPedido = function (){
                limpaArrayPedido();
            }
            
            $scope.limpaFormPedido = function (nomeForm) {
                nomeForm.cliente.$touched = false;
            };
            
            // Função para salvar os dados do pedido
            $scope.salvandoPedido = false;
            $scope.id_pedido = 0;

            $scope.salvaPedido = function (pedido) {
                pedido.usuario = 1; /* Criar uma função que a partir do cookie retorne o id do usuário*/
                $scope.salvandoPedido = true;
                $http.post(urlBase + "/pedidos/", pedido)
                        .success(function (data) {
                            $scope.pedido.id = data;
                            var mensagem = '<strong>Registro salvo.</strong> O pedido ' + data + ' foi salvo com sucesso!';

                            BootstrapDialog.alert({
                                title: 'Pedido armazenado com sucesso!',
                                message: mensagem,
                                type: BootstrapDialog.TYPE_SUCCESS, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                                closable: true, // <-- Valor default é false
                                buttonLabel: 'Fechar' // <-- Valor default é 'OK'                                
                            });

                            $scope.salvandoPedido = false;

                        })
                        .error(function (error, status) {
                            var mensagem = '<strong>Erro FATAL ao salvar.</strong> Ocorreu o seguinte erro ao salvar: ' + 'Número do Erro: ' + error + ' Detalhes: ' + status;

                            BootstrapDialog.alert({
                                title: 'Ocorreu um erro ao salvar o pedido!',
                                message: mensagem,
                                type: BootstrapDialog.TYPE_DANGER, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                                closable: true, // <-- Valor default é false
                                buttonLabel: 'Fechar' // <-- Valor default é 'OK'                                
                            });

                            $scope.salvandoPedido = false;
                        });
            };

            //Função para retornar o total do pedido
            $scope.totalPedido = function () {
                var total = 0;                
                angular.forEach($scope.itemPedido.itens, function (item) {
                    if (item.produto !== undefined){
                    total += item.quantidade * item.produto.preco;
                }
                });                                       
            return total.toFixed(2);
        };
           
            
            /*========================================================
             * FIM das Funções relacionados aos PEDIDOS
             ========================================================*/

            /*========================================================
             * ITENS DOS PEDIDOS
             ========================================================*/
            function limpaArrayItemPedido(id_pedido) {
                $scope.itemPedido = {itens: [{quantidade: 1, pedido: id_pedido}]};

            }

            $scope.limpaArrayItemPedido = function (id_pedido) {
                limpaArrayItemPedido(id_pedido);
            };
            $scope.adicionaItemPedido = function (id_pedido) {
                //unshift adiciona no inicio do array, enquanto push adiciona no fim
                $scope.itemPedido.itens.push({quantidade: 1, valor: 0, pedido: id_pedido});
            };
            $scope.removeItemPedido = function (item) {
                $scope.itemPedido.itens.splice($scope.itemPedido.itens.indexOf(item), 1);
            };
            $scope.salvandoItemPedido = true;
             $scope.salvaItemPedido = function (itempedido) {                
                $scope.salvandoItemPedido = true;
                $http.post(urlBase + "/itempedidos/", itempedido)
                        .success(function (data) {                            
                            var mensagem = '<strong>Registro salvo.</strong> Todos os dados do pedido foram salvos com sucesso!';

                            BootstrapDialog.alert({
                                title: 'Pedido armazenado com sucesso!',
                                message: mensagem,
                                type: BootstrapDialog.TYPE_SUCCESS, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                                closable: true, // <-- Valor default é false
                                buttonLabel: 'Fechar' // <-- Valor default é 'OK'                                
                            });

                            $scope.salvandoItemPedido = false;

                        })
                        .error(function (error, status) {
                            var mensagem = '<strong>Erro FATAL ao salvar.</strong> Ocorreu o seguinte erro ao salvar: ' + 'Número do Erro: ' + error + ' Detalhes: ' + status;

                            BootstrapDialog.alert({
                                title: 'Ocorreu um erro ao salvar o pedido!',
                                message: mensagem,
                                type: BootstrapDialog.TYPE_DANGER, // <-- valor default é BootstrapDialog.TYPE_PRIMARY
                                closable: true, // <-- Valor default é false
                                buttonLabel: 'Fechar' // <-- Valor default é 'OK'                                
                            });

                            $scope.salvandoItemPedido = false;
                        });
            };

            
            
            /*========================================================
             * FIM das Funções relacionados aos ITENS DOS PEDIDOS
             ========================================================*/


        });
app.controller('horaController', function ($scope, $interval) {
    var tick = function () {
        $scope.clock = Date.now();
    };
    tick();
    $interval(tick, 1000);
});
/* 
 * FILTRO PERSONALIZADO PARA EXIBIR OS DADOS FORMATADOS NA TABELA
 */

//Ao inves de exibir True ou False, exibe Sim ou Não

app.filter('simNao', function () {
    return function (input) {
        return input ? 'Sim' : 'Não';
    };
});
//Permite converter os dados em bytes
app.filter('bytes', function () {
    return function (bytes, precision) {
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes))
            return '-';
        if (typeof precision === 'undefined')
            precision = 1;
        var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
                number = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
    };
});
/*
 * FABRICA DE CONFIGURACOES (SIMILAR A VARIAVEL GLOBAL) 
 */

app.factory('Configuracoes', function () {
    return {nomeUsuario: ''};
});
/*
 * DIRETIVAS (POSSIBILITA CRIAR NOVAS TAGS NO HTML)
 */
// diretiva verificaSenha. No HTML chamamos como verifica-senha
app.directive('verificaSenha', [function () {
        return {
            scope: {comparasenha: '='},
            require: 'ngModel',
            link: function (scope, elem, attrs, ctrl) {
                var primeiraSenha = '#' + attrs.verificaSenha;
                elem.add(primeiraSenha).on('keyup', function () {
                    scope.$apply(function () {
                        var v = elem.val() === $(primeiraSenha).val();
                        ctrl.$setValidity("comparasenha", v);
                    });
                });
            }
        };
    }]);
//utilizado para converter um valor string em numerico
app.directive('campoPreco', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function (value) {
                return '' + value;
            });
            ngModel.$formatters.push(function (value) {
                return parseFloat(value);
            });
        }
    };
});



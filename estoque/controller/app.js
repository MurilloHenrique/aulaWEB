var app = angular.module('estoqueApp',[]);

app.controller('estoqueController', function($scope, $http){
	var urlBase = 'http://estoque.oo/api';
	//grupos
	limpaArrayGrupo();
	function limpaArrayGrupo(){
		$scope.grupo ={status:true};
	}
	$scope.carregaGrupos = function(){
		getGrupos();
	};
	function getGrupos(){
		$http.get(urlBase+"/grupos").success(function (data){
			$scope.grupos = data;
		}) .error(function() {
			console.log('Erro ao obter os dados do grupo');
			$scope.grupos = [];
		});
	};
	$scope.salvaGrupo = function (grupo){
		if (grupo.id === undefined) {
			grupo.id = 0;
		}
		$http.post(urlBase+"/grupos", grupo) . success(function (data){
			console.info("Grupo salvo!");
			alert("Grupo cadastrado com sucesso!");
			getGrupos(); // atualiza a tabela
			limpaArrayGrupo();
		}).error(function (error){
			console.error("Erro ao salvar o grupo: "+error);

		});
	};
});

app.filter('simNao',function(){
	return function(input){
		return input ? 'Sim': 'Não';
	};
});
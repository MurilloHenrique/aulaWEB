<?php

/*
 * PROJETO REST EM PHP
 * Para funcionar é necessário habilitar o mod_rewrite no Apache
 * Para fazer isso no WAMP: Selecione Apache\Apache Modules
 * Para fazer isso no Linux:
 * sudo a2enmod rewrite
 * sudo service apache2 restart
 * Editar o arquivo de configuração e inserir
 * sudo nano /etc/apache2/apache2.conf
 * <Directory "/var/www/html">
  Options FollowSymlinks
  AllowOverride All
  Order allow,deny
  Allow from all
  </Directory>
 *  */

//definido as variáveis para conexão ao SGBD
$db_host = '127.0.0.1';
$db_name = 'estoque';
$db_user = 'root';
$db_password = '';

// Carregando a lib Fat Free do PHP
$f3 = require('lib/base.php');
//Atribuimos que estamos em modo desenvolvimento. O modo produção é 0
$f3->set('DEBUG', 1);
//Conectando ao MySQL
$f3->set('DB', $db = new DB\SQL(
        "mysql:host=$db_host;port=3306;dbname=$db_name", $db_user, $db_password, array(\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION)));
/*
 * Definição das rotas REST da nossa aplicação
 *  */
$f3->route('GET /', 'inicio');

/* REST GRUPOS */
$f3->route('GET /grupos', 'getGrupos');
$f3->route('GET /grupos/@id', 'getGrupo');
$f3->route('GET /grupos/relacionado/@id', 'getGrupoRelacionado');
$f3->route('GET /grupos/nome/@nome/@id', 'getGrupoNome');
$f3->route('GET /grupos/graficos', 'getGrupoGrafico');
$f3->route('POST /grupos', 'salvaGrupo');
$f3->route('DELETE /grupos/@id', 'apagaGrupo');
/* REST USUARIOS */
$f3->route('GET /login/@usuario/@senha', 'getLogin');
$f3->route('GET /usuarios', 'getUsuarios');
$f3->route('POST /usuarios', 'salvaUsuario');
/* REST PRODUTOS */
$f3->route('GET /produtos', 'getProdutos');
$f3->route('GET /produtos/@id', 'getProduto');
$f3->route('POST /produtos', 'salvaProduto');
$f3->route('GET /produtos/nome/@nome/@id', 'getProdutoNome');
$f3->route('DELETE /produtos/@id', 'apagaProduto');
/* REST CLIENTES */
$f3->route('GET /clientes', 'getClientes');
/* REST PEDIDOS */
$f3->route('POST /pedidos', 'salvaPedido');
/* REST ITEM PEDIDOS */
$f3->route('POST /itempedidos', 'salvaItemPedido');

$f3->run(); //cria as rotas na navegação


/*
 * ============================================================================
 *  FUNÇÃO INICIAL DA API
 * ============================================================================
 */

function inicio() {
    echo '<h1>API REST</h1>
          <h2>Projeto Estoque Fatec</h2>';
    
}


/*
 * ============================================================================
 *  FUNÇÕES LIGADAS AO CADASTRO DE GRUPOS 
 * ============================================================================
 */

//Retorna todos os grupos a partir da URL /api/grupos via método GET
function getGrupos($f3) {
    $sql = "select id, nome, status, DATE_FORMAT(dataCriacao, '%Y-%m-%dT%10:00:00Z') as dataCriacao from grupos";
    try {
        $f3->set('dados', $f3->get('DB')->exec($sql));
        //pegaremos os valores do select e converteremos no formato JSON
        echo json_encode($f3->get('dados'));
    } catch (PDOException $e) {
        //se ocorrer algum erro, retornamos o código 500 e a mensagem de erro
        http_response_code(500);
        die($e->getMessage());
    }
}

//Retorna apenas o grupo com o id recebido no parametro a partir da URL /api/grupos/@id via método GET
function getGrupo($f3) {
    $id = $f3->get('PARAMS.id');
    $sql = "select id, nome, status, DATE_FORMAT(dataCriacao, '%Y-%m-%dT%10:00:00Z') as dataCriacao from grupos where id = ?";
    try {
        $f3->set('dados', $f3->get('DB')->exec($sql, array(1 => $id)));
        echo json_encode($f3->get('dados'));
    } catch (PDOException $e) {
        http_response_code(500);
        die($e->getMessage());
    }
}

//Retorna o total de produtos em cada grupo para a elaboração do gráfico utilizando a API do Google Charts
function getGrupoGrafico($f3) {
    $sql = "select grupos.nome, count(produtos.id) as qtde from produtos LEFT JOIN grupos ON produtos.id_grupo = grupos.id group by grupos.nome";
    try {
        $f3->set('dados', $f3->get('DB')->exec($sql));
        //pegaremos os valores do select e converteremos no formato JSON
        echo json_encode($f3->get('dados'));
    } catch (PDOException $e) {
        //se ocorrer algum erro, retornamos o código 500 e a mensagem de erro
        http_response_code(500);
        die($e->getMessage());
    }
}





//Apaga apenas o grupo com o id recebido no parametro a partir da URL /api/grupos/@id via método DELETE
function apagaGrupo($f3) {
    $id = $f3->get('PARAMS.id');
    $sql = "delete from grupos where id = ?";
    try {
        $f3->set('dados', $f3->get('DB')->exec($sql, $id));
        echo json_encode($f3->get('dados'));
    } catch (PDOException $e) {
        http_response_code(500);
        die($e->getMessage());
    }
}

//Salva o grupo recebido via JSON a partir da URL /api/grupos via método POST
function salvaGrupo($f3) {
    //obtendo os dados enviados via POST
    $json = file_get_contents('php://input', true);
    $obj = json_decode($json); // armazenamos o conteudo json em um array
    //echo var_dump($obj);
    $sql_insert = "insert into grupos (nome, status) values (?,?)";
    $sql_update = "update grupos set nome =?, status =? where id = ?";
    try {
        if ($obj->id != 0) { //se o id for diferente de 0, iremos fazer o update. Caso contrário, efetuamos o insert.
            $f3->set('dados', $f3->get('DB')->exec($sql_update, array(1 => $obj->nome, 2 => $obj->status, 3 => $obj->id)));
        } else {
            $f3->set('dados', $f3->get('DB')->exec($sql_insert, array(1 => $obj->nome,  2 => $obj->status)));
        }
        echo json_encode($f3->get('dados'));
    } catch (PDOException $e) {
        http_response_code(500);
        die($e->getMessage());
    }
}

//Retorna se o grupo está relacionado com algum produto a partir do id recebido no parametro a partir da URL /api/grupos/relacionado/@id via método GET
function getGrupoRelacionado($f3) {
    
    $id = $f3->get('PARAMS.id');    
    $sql = "select * from produtos where id_grupo = ?";
    try {
        $f3->get('DB')->exec($sql, array(1 => $id));
        echo $f3->get('DB')->count();               
    } catch (PDOException $e) {
        http_response_code(500);
        die($e->getMessage());
    }
}

//Retorna se o nome do grupo já existe a partir da descricao recebido no parametro a partir da URL /api/grupos/descricao/@descricao via método GET
function getGrupoNome($f3) {
    $id = $f3->get('PARAMS.id');
    $nome = $f3->get('PARAMS.nome');
    $sql = "select * from grupos where nome = ? and id <> ?";
    try {
        $f3->get('DB')->exec($sql, array(1 => $nome, 2 => $id));
        echo $f3->get('DB')->count();               
    } catch (PDOException $e) {
        http_response_code(500);
        die($e->getMessage());
    }
}


/*
 * ============================================================================
 *  FUNÇÕES LIGADAS AO CADASTRO DE PRODUTOS
 * ============================================================================
 */

//Retorna todos os produtos a partir da URL /api/produtos via método GET
function getProdutos($f3) {
    $sql = "select id, codigobarra, nome, preco, DATE_FORMAT(validade, '%Y-%m-%dT%10:00:00Z') as validade, status, foto, id_grupo from produtos";
    try {
        $f3->set('dados', $f3->get('DB')->exec($sql));
        //pegaremos os valores do select e converteremos no formato JSON
        echo json_encode($f3->get('dados')); //permite tags HTML no JSON; JSON_HEX_QUOT | JSON_HEX_TAG
    } catch (PDOException $e) {
        //se ocorrer algum erro, retornamos o código 500 e a mensagem de erro
        http_response_code(500);
        die($e->getMessage());
    }
}

//Retorna apenas o produto com o id recebido no parametro a partir da URL /api/produtos/@id via método GET
function getProduto($f3) {
    $id = $f3->get('PARAMS.id');
    $sql = "select id, codigobarra, nome, preco, DATE_FORMAT(validade, '%Y-%m-%dT%10:00:00Z') as validade, status, foto, id_grupo from produtos where id = ?";
    try {
        $f3->set('dados', $f3->get('DB')->exec($sql, array(1 => $id)));
        echo json_encode($f3->get('dados'));
    } catch (PDOException $e) {
        http_response_code(500);
        die($e->getMessage());
    }
}

//Apaga apenas o produto com o id recebido no parametro a partir da URL /api/produtos/@id via método DELETE
function apagaProduto($f3) {
    $id = $f3->get('PARAMS.id');
    $sql = "delete from produtos where id = ?";
    try {
        $f3->set('dados', $f3->get('DB')->exec($sql, $id));
        echo json_encode($f3->get('dados'));
    } catch (PDOException $e) {
        http_response_code(500);
        die($e->getMessage());
    }
}

//Salva o produto recebido via JSON a partir da URL /api/produtos via método POST
function salvaProduto($f3) {
    //obtendo os dados enviados via POST
    $json = file_get_contents('php://input', true);
    $obj = json_decode($json); // armazenamos o conteudo json em um array
    //echo var_dump($obj);
    $sql_insert = "insert into produtos (codigobarra, nome, preco, validade, status, foto, id_grupo) values (?,?,?,?,?,?,?)";
    $sql_update = "update produtos set codigobarra =?, nome =?, preco =?, validade=?, status=?, foto=?, id_grupo=? where id = ?";
    try {
        if ($obj->id != 0) { //se o id for diferente de 0, iremos fazer o update. Caso contrário, efetuamos o insert.
            $f3->set('dados', $f3->get('DB')->exec($sql_update, array(1 => $obj->codigobarra,  2 => $obj->nome, 3 => $obj->preco, 4 => $obj->validade, 5 => $obj->status, 6=> $obj->foto->base64, 7=> $obj->grupo->id, 8 => $obj->id)));
        } else {
            $f3->set('dados', $f3->get('DB')->exec($sql_insert, array(1 => $obj->codigobarra,  2 => $obj->nome, 3 => $obj->preco, 4 => $obj->validade, 5 => $obj->status, 6=> $obj->foto->base64, 7=> $obj->grupo->id)));
        }
        echo json_encode($f3->get('dados'));
    } catch (PDOException $e) {
        http_response_code(500);
        die($e->getMessage());
    }
}

function getProdutoNome($f3) {
    $id = $f3->get('PARAMS.id');
    $nome = $f3->get('PARAMS.nome');
    $sql = "select * from produtos where nome = ? and id <> ?";
    try {
        $f3->get('DB')->exec($sql, array(1 => $nome, 2 => $id));
        echo $f3->get('DB')->count();               
    } catch (PDOException $e) {
        http_response_code(500);
        die($e->getMessage());
    }
}

/*
 * ============================================================================
 *  FUNÇÕES LIGADAS AO CADASTRO DE USUARIOS
 * ============================================================================
 */

//Retorna todos os grupos a partir da URL /api/grupos via método GET
function getUsuarios($f3) {
    $sql = "select id, nome, login, status, tipo, foto from usuarios";
    try {
        $f3->set('dados', $f3->get('DB')->exec($sql));
        //pegaremos os valores do select e converteremos no formato JSON
        echo json_encode($f3->get('dados'));
    } catch (PDOException $e) {
        //se ocorrer algum erro, retornamos o código 500 e a mensagem de erro
        http_response_code(500);
        die($e->getMessage());
    }
}

//Salva o usuario recebido via JSON a partir da URL /api/usuarios via método POST
function salvaUsuario($f3) {
    //obtendo os dados enviados via POST
    $json = file_get_contents('php://input', true);
    $obj = json_decode($json); // armazenamos o conteudo json em um array
    //echo var_dump($obj);
    $sql_insert = "insert into usuarios (nome, login, foto, status, tipo, senha) values (?,?,?,?,?,md5(?))";
    $sql_update = "update usuarios set   nome =?, login =?, foto=?, status=?, tipo=?, senha= md5(?) where id = ?";
    try {
        if ($obj->id != 0) { //se o id for diferente de 0, iremos fazer o update. Caso contrário, efetuamos o insert.
            $f3->set('dados', $f3->get('DB')->exec($sql_update, array(1 => $obj->nome,  2 => $obj->login, 3 => $obj->foto->base64, 4 => $obj->status, 5 => $obj->tipo, 6=> $obj->senha, 7=> $obj->id)));
        } else {
            $f3->set('dados', $f3->get('DB')->exec($sql_insert, array(1 => $obj->nome,  2 => $obj->login, 3 => $obj->foto->base64, 4 => $obj->status, 5 => $obj->tipo, 6=> $obj->senha)));
        }
        echo json_encode($f3->get('dados'));
    } catch (PDOException $e) {
        http_response_code(500);
        die($e->getMessage());
    }
}

/* Função para validar o login */

function getLogin($f3) {
    $loginValido = false;
    $usuario = $f3->get('PARAMS.usuario');
    $senha = $f3->get('PARAMS.senha');
    $sql = "select * FROM usuarios where login=? AND AES_ENCRYPT(?,'fatec')=senha";    
    //iremos contar o número de registros retornados no count...
    $f3->set('dados', count($f3->get('DB')->exec($sql, array(1 => $usuario, 2 => $senha))));
    //Se o número for igual a 1, o usuario e a senha são válidos!
    if ($f3->get('dados') == 1) {
        $loginValido = true;
    }
    echo json_encode($loginValido);
}

/*
 * ============================================================================
 *  FUNÇÕES LIGADAS AO CADASTRO DE CLIENTES
 * ============================================================================
 */

//Retorna todos os clientes a partir da URL /api/clientes via método GET
function getClientes($f3) {
    $sql = "select id, nome, tipoCliente, cpf, cnpj, situacao from clientes order by situacao desc, nome";
    try {
        $f3->set('dados', $f3->get('DB')->exec($sql));
        //pegaremos os valores do select e converteremos no formato JSON
        echo json_encode($f3->get('dados'));
    } catch (PDOException $e) {
        //se ocorrer algum erro, retornamos o código 500 e a mensagem de erro
        http_response_code(500);
        die($e->getMessage());
    }
}


/*
 * ============================================================================
 *  FUNÇÕES LIGADAS AO CADASTRO DE PEDIDOS
 * ============================================================================
 */
//Salva o pedido recebido via JSON a partir da URL /api/pedidos via método POST

function salvaPedido($f3) {    
        $json = file_get_contents('php://input', true);
        $obj = json_decode($json); // Armazena o array com o JSON              
        $sql_insert = "insert into pedidos (cliente, usuario) values (?,?)";
        
        try {
            $f3->get('DB')->exec($sql_insert, array(1 => $obj->cliente->id, 2 => $obj->usuario));
            $f3->set('ultimo_id', $f3->get('DB')->lastInsertId());            
            echo $f3->get('ultimo_id');
        } catch (PDOException $e) {
            http_response_code(500);
            die($e->getMessage());
        }
    }

/*
 * ============================================================================
 *  FUNÇÕES LIGADAS AO CADASTRO DE ITENS DE PEDIDOS
 * ============================================================================
 */       
function salvaItemPedido($f3) {        
        $json = file_get_contents('php://input', true);
        $obj = json_decode($json); // Armazena o array com o JSON        
        $sql_insert = "insert into itempedidos (pedido, produto, quantidade) values (?,?,?)";
        foreach ($obj as $item) { //iremos percorrer os vários itens
            try {  
                $pedido = $item->pedido;
                $produto = $item->produto->id;
                $quantidade = $item->quantidade;
                
                $f3->set('dados', $f3->get('DB')->exec($sql_insert, array(1 => $pedido , 2 => $produto, 3 => $quantidade)));                
            } catch (PDOException $e) {
                http_response_code(500);
                die($e->getMessage());
            }
        }
        
    }
    
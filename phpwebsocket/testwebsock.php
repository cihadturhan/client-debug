#! /usr/local/bin/php
<?php
require_once('websockets.php');

error_reporting(E_ALL);
set_time_limit(0);

$home_webpage = 'index';
$admin_page = 'live_module';

function json_serialize($any) {
    return json_encode(json_wrap($any));
}

function json_unserialize($str) {
    return json_unwrap(json_decode($str));
}

function json_wrap($any, $skipAssoc = false) {
    if (!$skipAssoc && is_array($any) && is_string(key($any))) {
        return (object) array("_PHP_ASSOC" => json_wrap($any, true));
    }
    if (is_array($any) || is_object($any)) {
        foreach ($any as &$v) {
            $v = json_wrap($v);
        }
    }
    return $any;
}

function json_unwrap($any, $skipAssoc = false) {
    if (!$skipAssoc && is_object($any) && is_object($any->_PHP_ASSOC) && count((array) $any) == 1) {
        return (array) json_unwrap($any->_PHP_ASSOC);
    }
    if (is_array($any) || is_object($any)) {
        foreach ($any as &$v) {
            $v = json_unwrap($v);
        }
    }
    return $any;
}

class echoServer extends WebSocketServer {

    protected $maxBufferSize = 5242880; //5MB... overkill for an echo server, but potentially plausible for other applications.

    protected function process($user, $message) {
        global $home_webpage, $admin_page;

        $response = json_decode($message, true);

        switch ($response['method']) {
            // forward bir kullaniciyi komut gondermek icin kullanilir
            //forward icin kullanicinin hem registered hem de admin olmasi gerek
            case 'forward':
                if (isset($user->admin) && $user->admin && $user->page == $admin_page) {
                    $forwarded_user = $this->getUserById($response['id']);
                    echo "Forwarding...\n";

                    //verilen kullanici id'si bizde bulunmamis olabilir
                    if ($forwarded_user == null) {
                        echo 'Forwarded user not found!';
                        break;
                    }

                    $query = Array(
                        'mode' => $response['mode'],
                        'text' => $response['text']
                    );
                    try {
                        $this->send($forwarded_user, json_encode($query));
                    } catch (Exception $e) {
                        var_dump($e);
                    }
                } else {
                    echo 'administration error \n';
                }
                break;
            // response bir kullaniciya gonderilen komutun cevabini goruntelemek icin kullanilir.
            // gelen cevap tum yonetim moduldeki adminlere lere gonderilir
            case 'response':
                foreach ($this->users as $t_user) {
                    if (isset($t_user->admin) && $t_user->admin && $t_user->page == $admin_page) {
                        echo "Getting forwarded response...\n";
                        $this->send($t_user, $message);
                    }
                }
                break;
            case 'get':
                echo "Getting variables ...\n";
                if (isset($user->admin) && $user->admin && $user->page == $admin_page) {
                    $user_list = Array();
                    foreach ($this->users as $user) {
                        $user_list[] = json_wrap($user);
                    }

                    $result = Array('method' => 'response', 'result' => $user_list);
                    var_dump($result);

                    if ($response['mode'] == 'users') {
                        $this->send($user, json_encode($result, JSON_OBJECT_AS_ARRAY, 1));
                    }
                } else {
                    echo 'Administration error!\n';
                }
                break;
            case 'register':
                //güvenlik önlemleri
                echo "Registering user...\n";
                $user_id = $response['user_id'];
                $sess = $response['sess'];
                $user_name = $response['user_name'];
                //sayfanin yukarida belirtilen iki sayfa haricinde bir yer olmamasi lazim
                $page = $response['page'];
                if ($page == $admin_page || $page == $home_webpage) {
                    //
                } else {
                    echo 'wrong page: ' + $page;
                    $page = 'undefined';
                }

                socket_getpeername($user->socket, $ip);
                //local ip icin donusturme
                $ip = ($ip == '127.0.0.1') ? ('::1') : ($ip);

                //global $db, $t_sessions, $t_users;
                //$result = $db->getQ("SELECT sess,admin FROM $t_sessions s , $t_users u WHERE s.kid = u.id and kid=$user_id AND sess='$sess' AND ip='$ip'");

                $user->admin = ($page == 'live_module');
                $user->user_id = intval($user_id);
                $user->user_name = $user_name;
                $user->page = $page;
                break;
            case 'echo':
                break;
            default:
                echo 'Wrong method! : ' . $response['method'] . '\n';
        }
    }

    protected function connected($user) {
        //print_r($user);
        // Do nothing: This is just an echo server, theres no need to track the user.
        // However, if we did care about the users, we would probably have a cookie to
        // parse at this step, would be looking them up in permanent storage, etc.
    }

    protected function closed($user) {
        // Do nothing: This is where cleanup would go, in case the user had any sort of
        // open files or other objects associated with them.  This runs after the socket 
        // has been closed, so there is no need to clean up the socket itself here.
    }

}

$echo = new echoServer("127.0.0.1", "9000");
try {
    $echo->run();
} catch (Exception $e) {
    $echo->stdout($e->getMessage());
}

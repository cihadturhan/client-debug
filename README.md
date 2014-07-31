client-debug
============

What do clients say when there is a problem in your web page?

> It's not working.

What info do they provide?

> A big nothing.

What does your boss say?

> Fix the error!

But, what error?

>Well, dear friend, you're all alone. Find it and solve.

Are you tired of this sh*t?

Yes, I do and created this library because I'm over it. Without any detailed error log, it's a huge pain to resolve the problem. This library lets you
connect the clients when they are on your site and gives you opportunity to do followings

- Lazyload any javascript/css file and use it.

- Dump complete HTML they are viewing all css and javascript files

- Silently run your tests and see results

- Measure pings to your server

- Evaluate any javascript code in realtime

- Listen all the click, keydown, bla bla events instantly

- More? It's up to your imagination. Have an idea? Report on [issues page](/issues).


Serverside script only depends socket.io

If you want to use admin interface as it is, angular.js is required. 
Don't know angular? Convert it to a jquery and create a pull request. I'll happily accept it.
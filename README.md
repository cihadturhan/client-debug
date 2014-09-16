client-debug
============
Think you have developed a web app, tested all the modules and released.<br/>
And a problem occured on the client side because of localization, browser type etc.

What do clients say when there is a problem in your web page?

> It's not working.

What info do they provide?

> A big nothing. Because they are a  regular user.

What does your boss say?

> Fix the error!

But, what error?

>Well, dear friend, you're all alone. Find it and solve.

Are you tired of this sh*t?

Yes, I do and created this library. Sometimes a detailed error log still doesn't work and
you should be on the computer which customer uses. This library lets you connect the clients
when they are on your web page and gives you opportunity to do followings:

- Lazyload any javascript/css file and use it.

- Dump complete HTML they are viewing with all css and javascript files

- Silently run your tests and see results

- Measure pings to your server

- Evaluate any javascript code in realtime

- Listen all the click, keydown, bla bla events instantly

- More? It's up to your imagination. Have an idea? Report on [issues page](/issues).


Serverside script only depends socket.io
Admin panel uses jquery

Want to add new item on the list? Read [contributing.md](/blob/master/CONTRIBUTING.md) and submit a pull request, I'll happily accept it.

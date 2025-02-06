 git branch -M main ise exisiting current branch ko main rename krdete h

 how to store images?
        obv we will use 3rd party service like aws,coudnery
        first user upload the images then we will store the images temporarily on server bcoz if there is some cncntion lost to safe rhay
        some companies direct upload krdeti h

.gitkeep-gitkeep is itself empty
        note:to git ignore empty folders and doesnt push them as git pushes files and not folder
        so,therefore to maintain the work flow of the file we may sometime need to push those empty folder also
        therefore we make a file .gitkeep(maybe of diff name)
        cd public/temp/

.env
        environment variables system se uthaye jate h files se nhi
        ye code jb backend mein jate h like servers Aws ye sb wha pe bhi .env krke file hota h

.git commands
        ->cd change directory to,eg:cd src

        ->ls list all fiiles ind=side that directory
                If you run ls inside a folder containing:
                /my-folder
                        ├── file1.txt
                        ├── file2.txt
                        ├── folder1/
                        ├── folder2/
                ls
                op->file1.txt  file2.txt  folder1  folder2

                if you want to see the files inside folder1, run:
                        ls folder1

        ->cd ..

        ->touch app.js constants.js index.js
nodemon--(npm i -D nodemon )-D for dev depandancy
        jaise hi file save hoti h server ko restart krdeta h
        dev dependancy-wo dependancy jo hm devlopment ke sme use krte h main prdn mein nhi lejate h
        ise file ka size kch bhi ho hme frk nhi pta
        //install krne ke bad node modules aaya mgr q ki gitignore mein already h to git mein push nhi horha ye sb aur package json mein update bhi hogya

        "scripts": {
                "dev": "nodemon src/index.js"
        }
        This is a custom script inside package.json that allows you to run a specific command using npm run dev.
        🔹 Breaking It Down
	1.	"dev" → The name of the script (you can run it using npm run dev).
	2.	"nodemon src/index.js" → The command that runs when you execute npm run dev.



controllers(src)->majorly functionality
db->database cnct kaise hota h
middlewares->code jo in bw run krwana ho,->ek req aai,wo request agr server fulfill kre use pehle agr mein kch checking lgana chahta hun to wo middleware h
eg:apni cookies pehle do ki aap us info ko lene lyk ho ya nhi
models->
routes->kafi complex hojate h (app.get(),fetch aise kam nhi krte h)
utils->utlities--->>hm jb kam krenge to hme dher sari utilities lgegi,like file upload ek utility h
        eg:file upload(ek utility h)hm apne user se profile mein bhi krwaoge video mein bhi,mail ki utility

        jo fn bar bar repeat hogi usko utility folder mein jb jb suvidha hoga utha lenge 





How to connect database in MERN with debugging?
        we will use mongoDb database,we will use online one
        db connection 2 major trike se hoskta h
        1.sara ka sara code index file ke through run krane wale h q ki wo (package.json dekh wo main ke andr index.js h iska mtlb jb bhi code run hoga to sbse pehle index.js run hoga),isliye sbkch usme rkh dete h
                jaise hi fn chalu ho(index.js load ho) to wo fn jisme database cncntn ka code likha ho execute kra de

        2.ek db nam ka ek folder bnate h usme jo bhi cnctn ka fn likhte h aur fir index file mein us fn ko import krwauu aur wha execcute krwauu
           
.database se jb bhi cnctn baithao tb use try catch or promises bcoz in many cases error comes
//databases is always in another continent(db se jb bhi kch mangenge to sme lgta h to async await)
        .async await
        .try catch,promises

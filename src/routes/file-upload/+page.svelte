<script lang="ts">
    // 
    let files : FileList;

    $: if(files)
    {
        for(let file of files)
        {
            // fetch("https://datastoragesl.somedude0.repl.co/upload",{
            //     method: "POST"
            // });
        }
    }

    async function SubmitFiles() 
    {
        if(!files) return;
        for(let file of files)
        {
            let data : FormData = new FormData();
            data.append("file", file);
            await fetch("https://datastoragesl.somedude0.repl.co/upload",{
                method: "POST",
                body: data
            });
        }
    }
</script>

<main>
    <!--  -->
    <div class="title">ОБНОВЛЕНИЕ ДАННЫХ</div>
    <div class="instructions-title">Порядок действий</div>
    <ul class="instructions">
        <li>Сформировать ведомость по типу отчета "Для_сбора_"</li>
        <li>Сохранить в файл txt</li>
        <li>Загрузить полученный файл</li>
    </ul>
    <input bind:files={files} required accept="text/txt" type="file" name="file" id="file-input">
    <button on:click={SubmitFiles} on:keydown={SubmitFiles} type="submit">Отправить</button>
</main>

<style>
    /*  */
    main{
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .title{
        padding: 5px;
        margin: 2px;
        border-bottom: 1px solid black;
        text-align: center;
        width: 100%;
        font-size: 2rem;
    }

    .instructions-title{
        font-size: 1.5rem;
    }

    input{
        margin: 25px;
        font-size: 1rem;
    }
    button{
        font-size: 2rem;
    }
</style>
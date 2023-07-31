<script lang="ts">
	import { PUBLIC_DATA_URL } from "$env/static/public";
  import Page from "../routes/+page.svelte";

    // 
    let files : FileList;
    let VISIBLE = false;
    let UPLOADING = false;
    let UPLOAD_DONE = false;

    $: if(files)
    {
        for(let file of files)
        {
            // fetch( PUBLIC_DATA_URL + "/upload",{
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

            UPLOADING = true;
            UPLOAD_DONE = false;
            await fetch( PUBLIC_DATA_URL + "/upload",{
                method: "POST",
                body: data
            });
            UPLOADING = false;
            UPLOAD_DONE = true;
        }
    }
    export function Toggle(state : boolean)
    {
        if(state !== undefined)
        {
            VISIBLE = state;
        }
        else
        {
            VISIBLE = !VISIBLE;
        }
    }
    function CloseModal()
    {
        UPLOAD_DONE = false;
        Toggle(false);
    }
</script>

<main style="display: {VISIBLE ? "flex" : "none"}">
    <!--  -->
    <div class="title">ОБНОВЛЕНИЕ ДАННЫХ</div>
    <div class="instructions-title">Порядок действий</div>
    <ul class="instructions">
        <li>Сформировать ведомость по типу отчета "Для_сбора_"</li>
        <li>Сохранить в файл txt (имя файла любое)</li>
        <li>Загрузить полученный файл</li>
    </ul>
    <input bind:files={files} required accept="text/txt" type="file" name="file" id="file-input">
    <div class="buttons">
        <button on:click={SubmitFiles} on:keydown={SubmitFiles} type="submit">Отправить</button>
        <button on:click={CloseModal} on:keydown={CloseModal} type="submit">Закрыть</button>
    </div>
    <div style="display: {UPLOADING ? "flex" : "none"};" class="upload-indicator upload-process-inticator">Загрузка...</div>
    <div style="display: {UPLOAD_DONE ? "flex" : "none"};" class="upload-indicator upload-done-inticator">Загрузка завершена</div>
</main>

<style>
    /*  */
    main{
        flex-direction: column;
        justify-content: center;
        align-items: center;
        position: absolute;
        background-color: white;
        inset: 0;
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

    .upload-indicator{
        font-size: 2rem;
    }
</style>
<script lang="ts">
	import { PUBLIC_DATA_URL } from "$env/static/public";
	import { onMount } from "svelte";

    // 
    let modal_show: boolean = false;

    let INPUT_ELEMENT: HTMLInputElement;
    let input_value: string;

    
    let feedback_data: App.FeedbackData = {};

    export let ToggleModal = function(state?: boolean)
    {
        modal_show = state ? state : !modal_show;
    }
    function CloseModal()
    {
        ToggleModal(false);
    }
    function StopProp(event: KeyboardEvent | MouseEvent)
    {
        event.stopPropagation();
    }

    onMount(()=>{
        // 
        INPUT_ELEMENT.addEventListener("keydown", async (event)=>{
            if(event.code === "Enter" || event.code === "NumpadEnter" || event.key === "Enter")
            {
                SendFeedback();
            }
        });

        GetFeedback();
        setInterval(GetFeedback,30000);
    });

    async function SendFeedback()
    {
        let feedback: string = input_value;
        input_value = "";
        let request = await fetch( PUBLIC_DATA_URL + "/feedback",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                command: "insert",
                message: feedback
            })
        });
        GetFeedback();
    }
    async function GetFeedback()
    {
        let request = await fetch( PUBLIC_DATA_URL + "/feedback",{method: "GET"});
        feedback_data = await request.json();
    }
</script>

<main on:click={CloseModal} on:keydown={CloseModal} style="display: {modal_show ? "flex" : "none"};">
    <div class="body" on:click={StopProp} on:keydown={StopProp}>
        <!--  -->
        <div class="close-btn" on:click={CloseModal} on:keydown={CloseModal}><img src="Cross.svg" alt="Close Cross"></div>
        <div class="title">Предложения</div>
        <div class="list">
            <!--  -->
            {#each Object.entries(feedback_data) as [id,item]}
                <div class="item">
                    <div class="message">{item.message}</div>
                    <div class="timestamp">{new Date(item.timestamp).toLocaleDateString("ru-RU",{year: 'numeric', month: 'long', day: 'numeric', hour: "numeric", minute: "numeric", second: "numeric"}) }</div>
                    <div class="status {item.status ? "done" : "pending"}">{item.status ? "Выполнено" : "Не выполнено"}</div>
                </div>
            {/each}
        </div>
        <div class="chat-box">
            <input type="text" placeholder="Вводите свои предложения сюда..." bind:this={INPUT_ELEMENT} bind:value={input_value}>
            <button on:click={SendFeedback} on:keydown={SendFeedback} class="send-btn">send<img src="ArrowRight.svg" alt="Arrow Right"></button>
        </div>
    </div>
</main>

<style>
    /*  */
    main{
        position: absolute;
        display: flex;
        inset: 0;
        background-color: #00000022;
        justify-content: center;
        align-items: center;
    }
    .body{
        background-color: white;
        width: min(650px, 90%);
        height: min(900px, 95%);
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        padding: 10px;
        border: 1px solid black;
        filter: drop-shadow(1px 1px 5px) drop-shadow(-1px -1px 5px);
        overflow-y: scroll;
        overflow-x: hidden;
        box-sizing: border-box;
        position: relative;
    }

    .title{
        display: flex;
        justify-content: center;
        font-size: 1.5rem;
        font-weight: 600;
    }

    .list{
        flex: 1;
        overflow-y: scroll;
    }

    .item{
        border: 1px solid black;
        padding: 5px;
        margin: 5px;
        border-radius: 5px;
    }
    .timestamp{
        font-size: 0.7rem;
    }

    .chat-box{
        display: flex;
        gap: 5px;
    }
    .chat-box input{
        flex: 10;
    }
    .send-btn{
        flex: 1;
        display: flex;
        font-size: 0.75rem;
        justify-content: center;
        align-items: center;
    }
    .send-btn img{
        width: 1rem;
        height: 1rem;
    }
    .status{
        font-size: 0.75rem;
    }

    .close-btn{
        position: absolute;
        width: 2rem;
        height: 2rem;
        right: 1rem;
        top: 1rem;
        cursor: pointer;
    }
    .close-btn img{
        width: 100%;
        height: 100%;
    }

    .status.done{
        border: green;
    }
    .status.pending{
        border: red;
    }
</style>
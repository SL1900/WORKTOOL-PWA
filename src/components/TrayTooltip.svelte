<script>
// @ts-nocheck

    //
    let messages = [];

    let CurrentTimestamp = Date.now();

    setInterval(()=>{
        CurrentTimestamp = Date.now()
        for(let index in messages)
        {
            if(CurrentTimestamp - messages[index].timestamp > 5000) messages[index].expired = true;
        }

        let i = 0;
        while(i < messages.length)
        {
            if(messages[i].expired)
            {
                messages.splice(i,1);
            }
            else
            {
                i++;
            } 
        }
    },100);

    export const AddMessage = function(message){
        messages.push({
            text: message,
            timestamp: Date.now(),
            expired: false,
            borderColor: "red"
        });
        messages = messages;
    };
</script>

<main class="{messages.length ? "" : "hidden"}">
    <!--  -->
    
    {#each messages as message}
        <div style="--border-color: {message.borderColor};" class="message {message.expired ? "expired" : ""}">{message.text}</div>
    {/each}
    {#if messages.length}
        <div class="title">Notifications ({messages.length})</div>
    {/if}
</main>

<style>
    /*  */
    main{
        position: absolute;
        right: 0;
        bottom: 0;
        padding: 10px;
        border: 1px solid black;
        background-color: white;
        border-radius: 10px;
    }
    .title{
        float: right;
    }
    .message{
        padding: 2px;
        border: 1px solid var(--border-color);
        border-radius: 5px;
    }
    .hidden{
        display: none;
    }
    .message{
        display: flex;
    }
    .expired{
        border: 2px solid red;
    }
</style>
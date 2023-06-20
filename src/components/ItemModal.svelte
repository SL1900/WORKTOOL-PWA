<script lang="ts">
    // 
    export let details: App.ItemData = {
		 name: "",
		 id: "",
		 cells: {},
		 unit: ""
	 };
    let modal_show = false;

    export let ToggleModal = function(state?: boolean)
    {
        if(state)
        {
            modal_show = state;
        }
        else
        {
            modal_show = !modal_show;
        }
    }
    function CloseModal()
    {
        ToggleModal(false);
    }
    function StopProp(event: KeyboardEvent | MouseEvent)
    {
        event.stopPropagation();
    }
</script>

<main on:click={CloseModal} on:keydown={CloseModal} style="display: {modal_show ? "flex" : "none"};">
    <!--  -->
    <div class="body" on:click={StopProp} on:keydown={StopProp}>
        <div class="name">{details.name}</div>
        <div class="nsi-pr">{details.nsi} / {details.pr}</div>
        <div class="cells">
            {#each Object.entries(details.cells) as [cellName, amount]}
                <!--  -->
                <div class="cell">{cellName} : {amount}</div>
            {/each}
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
        height: min(900px, 50%);
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        padding: 10px;
        border: 1px solid black;
        filter: drop-shadow(1px 1px 5px) drop-shadow(-1px -1px 5px);
    }
</style>
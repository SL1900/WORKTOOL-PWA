<script lang="ts">
	import { onMount } from "svelte";
	import TrayTooltip from "../components/TrayTooltip.svelte";
	import ItemModal from "../components/ItemModal.svelte";

    let AddMessage : (message: string) => void;
    let ToggleModal : (state?: boolean) => void;
    let modalItem: App.ItemData;

    let data : App.DataFile = {};
    let items: App.ItemData[] = [];
    let filteredItems : App.ItemData[] = [];
    let displayItems : App.ItemData[] = [];

    let search_string = "";
    let current_page = 0;

    let INITIAL_LOADING = true;

    $:{
        data;
        for(let [id, item] of Object.entries(data))
        {
            items.push({...item,id});
        }
        items = items;
    }
    $:{
        let filteredResult = items;

        for(let term of search_string.split(" "))
        {
            term = term.toLowerCase();
            let minus_term = term.startsWith("-");
            if(minus_term) term = term.slice(1);
            if(!term) continue;

            filteredResult = filteredResult.filter( (item) => {
                let term_matched = item.name.toLowerCase().includes(term) || item.nsi.toLowerCase().includes(term) || item.pr.toLowerCase().includes(term);
                return term_matched === !minus_term;
            });
        }
        filteredItems = filteredResult;
    }

    onMount( async ()=>{
        //
        try
        {
            let response = await fetch("https://datastoragesl.somedude0.repl.co/download");
            data = await response.json();
            INITIAL_LOADING = false;
        }
        catch(error)
        {
            console.log(error);
        }
        //
    });

    function ItemSelect(event: KeyboardEvent | MouseEvent)
    {
        modalItem = data[this.getAttribute("data-id")];
        ToggleModal(true);
    }
</script>

<main>
    <!--  -->
    {#if INITIAL_LOADING}
        <!--  -->
        <div class="loading-page">
            ЗАГРУЗКА...
        </div>
    {:else}
        <div class="search-bar">
            <div class="text">Поиск:</div>
            <input type="text" bind:value={search_string}>
            <div class="search-bar-clear-btn">Очистить</div>
        </div>
        <div class="status-bar">
            <div class="items-count">Результатов: {filteredItems.length} шт.</div>
        </div>
        <div class="list">
            <!--  -->
            {#each filteredItems.slice(0,50) as item, index}
                <div class="item { index % 2 ? "odd" : "even"}" on:click={ItemSelect} on:keydown={ItemSelect} data-id="{item.id}">
                    {index}
                    <div class="details">
                        <div class="name">{item.name}</div>
                        <div class="nsi-pr">{item.nsi} / {item.pr}</div>
                        <div class="cells-list">
                            {#each Object.entries(item.cells) as [cellName, count]}
                                <div class="cell">
                                    <div class="cell-name">{cellName}</div>
                                    <div class="cell-amount">{(count % 1) !== 0 ? count.toFixed(3) : count} {item.unit}</div>
                                </div>
                            {/each}
                        </div>
                    </div>
                    <div class="details-btn">
                        <img src="resize.png" alt="Open Item Details">
                    </div>
                </div>
            {/each}
        </div>
        <ItemModal bind:ToggleModal={ToggleModal} bind:details={modalItem} />
    {/if}
    <TrayTooltip bind:AddMessage={AddMessage} />
</main>

<style>
    .loading-page{
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        animation: loading-glow 2s infinite;
        background-color: lightgray;
    }
    @keyframes loading-glow{
        0%{
            filter: blur(0px) brightness(100%);
        }
        50%{
            filter: blur(1px) brightness(65%);
        }
        100%{
            filter: blur(0px) brightness(100%);
        }
    }
    /*  */
    main{
        display: flex;
        flex-direction: column;
        height: 100%;
        font-size: 1rem;
    }

    .search-bar{
        display: flex;
        border-bottom: 1px solid black;
        padding: 5px;
        justify-content: center;
    }
    .search-bar input{
        flex: 1;
    }
    
    .list{
        /* border: 1px solid blue; */
        flex: 1;
        overflow: hidden;
        overflow-y: auto;
        min-height: 0;
    }

    .item{
        border: 1px solid black;
        display: flex;
        padding: 5px;
        margin: 5px;
        border-radius: 10px;
    }
    /* .item.even{
        border-color: wheat;
    }
    .item.odd{
        border-color: red;
    } */

    .details{
        flex: 1;
    }
    .details .nsi-pr{
        font-size: 0.70rem;
    }
    .details .cells-list{
        float: right;
        font-size: 0.8rem;
        min-width: 60%;
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .details-btn{
        width: 20px;
        display: flex;
        align-items: center;
        padding: 2px;
        margin: 2px;
    }
    .details-btn img{
        aspect-ratio: 1;
        max-width: 100%;
    }


    .cell{
        display: flex;
        gap: 10px;
        justify-content: space-between;
        min-width: 75%;
        border-bottom: 1px solid black;
    }
    .cell .cell-amount{
        float: right;
    }
</style>
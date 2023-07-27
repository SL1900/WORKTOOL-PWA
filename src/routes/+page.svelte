<script lang="ts">
	import { onMount } from "svelte";
	import TrayTooltip from "../components/TrayTooltip.svelte";
	import ItemModal from "../components/ItemModal.svelte";
	import MapModal from "../components/MapModal.svelte";
    import UploadModal from "../components/UploadModal.svelte";

    let AddMessage : (message: string) => void;
    let ToggleUploadModal : (state : boolean) => void;
    let ToggleModal : (state?: boolean) => void;
    let modalItem: App.ItemData;

    let LAST_UPDATE : number = 0;
    let LAST_UPDATE_STRING : string = "";

    let data : App.DataFile = {};
    let items: App.ItemData[] = [];
    let filteredItems : App.ItemData[] = [];
    let displayItems : App.ItemData[] = [];

    let search_string = "";
    let current_page = 0;

    let INITIAL_LOADING = true;

    let SEARCH_INPUT_ELEMENT : HTMLInputElement;
    let UPLOAD_MODAL : UploadModal;
    let SEARCH_TERMS : App.SearchTerm[] = [];

    $:{
        data;
        items = [];
        for(let [id, item] of Object.entries(data))
        {
            items.push({...item,id, highlights: {name: [], nsi: [], pr: []}});
        }
        items = items;
    }

    let filteredResult = items;
    $:{
        filteredResult = JSON.parse(JSON.stringify(items));

        SEARCH_TERMS = [];

        for(let term of search_string.split(" "))
        {
            term = term.toLowerCase();
            let minus_term = term.startsWith("-");
            if(minus_term) term = term.slice(1);
            if(!term) continue;

            SEARCH_TERMS.push({
                text: term,
                exclude: minus_term
            });

            
            filteredResult = filteredResult.filter( (item, item_index) => {
                const Fields = ["name","nsi","pr"] as const;
                type Matches = {
                    [name in typeof Fields[number]]: boolean
                };
                let matches: Matches = {
                    name: item.name.toLowerCase().includes(term),
                    nsi: item.nsi.toLowerCase().includes(term),
                    pr: item.pr.toLowerCase().includes(term)
                };
                
                let term_matched: boolean = !!(matches.name || matches.nsi || matches.pr);

                for(let [field, matched] of Object.entries(matches))
                {
                    if(matched)
                    {
                        let term_index = item[field as typeof Fields[number]].toLowerCase().indexOf(term.toLowerCase());
                        filteredResult[item_index].highlights[field as "name" | "nsi" | "pr"].push([term_index, term.length]);
                        // filteredResult[item_index][field] = 
                        //     item[field].slice(0,term_index) + 
                        //     `<span class="highlight">` + 
                        //     item[field].slice(term_index, term_index + term.length) + 
                        //     "</span>" + 
                        //     item[field].slice(term_index + term.length);
                    }
                }

                return term_matched === !minus_term;
            });
        }
        filteredItems = filteredResult;
    }

    onMount( async ()=>{
        try {
            //
            let data_string = localStorage.getItem("data_string");
            if(!data_string) throw new Error("No data saved");

            data = JSON.parse(data_string);

            LAST_UPDATE = Number.parseInt(localStorage.getItem("last_update") as string);
            LAST_UPDATE_STRING = GetLastUpdateString(LAST_UPDATE);

            INITIAL_LOADING = false;
            console.log("Loaded from storage");
        } catch (error) {
            //
        }
        //
        try
        {
            let items_data = await fetch("https://datastoragesl.somedude0.repl.co/download");
            data = await items_data.json();
            let last_update = await fetch("https://datastoragesl.somedude0.repl.co/last_update");
            LAST_UPDATE = (await last_update.json()).timestamp;
            LAST_UPDATE_STRING = GetLastUpdateString(LAST_UPDATE);

            localStorage.setItem("data_string",JSON.stringify(data));
            localStorage.setItem("last_update", LAST_UPDATE.toString());

            setInterval(()=>{
                LAST_UPDATE_STRING = GetLastUpdateString(LAST_UPDATE);
            },5000);
            INITIAL_LOADING = false;
        }
        catch(error)
        {
            console.log(error);
        }
        //
    });

    function ItemSelect(this: HTMLElement, event: KeyboardEvent | MouseEvent)
    {
        let item_id : string = this.getAttribute("data-id") as string;
        modalItem = data[item_id as keyof typeof data];
        ToggleModal(true);
    }
    function ClearSearch()
    {
        search_string = "";
        SEARCH_INPUT_ELEMENT.focus();
    }
    function GetHighlightedString(id: number,field: "name" | "nsi" | "pr", item_id: string)
    {
        let merged_highlights = [];
        let highlights = filteredItems[id].highlights[field];
        highlights = highlights.sort( (a,b) => a[0] - b[0] || a[1] - b[1]);

        for(let i = 0; i < highlights.length; i++)
        {
            if(!merged_highlights.length) merged_highlights.push(highlights[i])
            else
            {
                if(highlights[i - 1][0] + highlights[i - 1][1] > highlights[i][0])
                {
                    merged_highlights[merged_highlights.length - 1][1] = highlights[i][0] + highlights[i][1] - highlights[i - 1][0];
                }
                else
                {
                    merged_highlights.push(highlights[i]);
                }
            }
        }

        let result_string = filteredItems[id][field]
        for(let i = merged_highlights.length - 1; i >= 0; i--)
        {
            result_string = 
                result_string?.slice(0,merged_highlights[i][0]) + 
                '<span class="highlight">' + 
                result_string?.slice(merged_highlights[i][0], merged_highlights[i][0] + merged_highlights[i][1]) + 
                "</span>" + 
                result_string?.slice(merged_highlights[i][0] + merged_highlights[i][1]);
        }
        return result_string;
    }
    function GetLastUpdateString(timestamp: number)
    {
        let diff = new Date().getTime() - timestamp;

        let days    = Math.floor(diff / 1000 / 60 / 60 / 24);
        let hours   = Math.floor(diff / 1000 / 60 / 60);
        let minutes = Math.floor(diff / 1000 / 60);
        let seconds = Math.floor(diff / 1000);

        let time_string = "";

        {
            let declination = "";
            let amount = 0;

            let rest = days % 10;

            if(days > 10 && days < 15) declination = "дней";
            else if(rest % 10 == 1) declination = "день";
            else if(rest > 1 && rest < 5) declination = "дня";
            else declination = "дней";

            amount = days;

            time_string += ` ${amount} ${declination}`;
        }
        
        {
            let declination = "";
            let amount = 0;

            hours = hours % 24;

            let rest = hours % 10;

            if(hours > 10 && hours < 15) declination = "часов";
            else if(rest % 10 == 1) declination = "час";
            else if(rest > 1 && rest < 5) declination = "часа";
            else declination = "часов";

            amount = hours;
            time_string += ` ${amount} ${declination}`;
        }
        
        {
            let declination = "";
            let amount = 0;

            let rest = minutes % 10;
            minutes = minutes % 60;

            if(minutes > 10 && minutes < 15) declination = "минут";
            else if(rest % 10 == 1) declination = "минуту";
            else if(rest > 1 && rest < 5) declination = "минуты";
            else declination = "минут";

            amount = minutes;
            time_string += ` ${amount} ${declination}`;
        }

        return `Последнее обновление${time_string} назад`;
    }

    function ShowUploadModal()
    {
        ToggleUploadModal(true);
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
            <input type="text" bind:this={SEARCH_INPUT_ELEMENT} bind:value={search_string}>
            <div class="search-bar-clear-btn" on:click={ClearSearch} on:keydown={ClearSearch}>Очистить</div>
        </div>
        <div class="status-bar">
            <div class="items-count">Результатов: {filteredItems.length} шт.</div>
            {#each SEARCH_TERMS as term}
                <div class="search-term {term.exclude ? "exclude" : "include"}">{term.text}</div>
            {/each}
        </div>
        <div class="list">
            <!--  -->
            {#each filteredItems.slice(0,50) as item, index}
                <div class="item { index % 2 ? "odd" : "even"}" on:click={ItemSelect} on:keydown={ItemSelect} data-id="{item.id}">
                    <div class="details">
                        <div class="name">{@html GetHighlightedString(index, "name",item.id)}</div>
                        <div class="nsi-pr">{@html GetHighlightedString(index, "nsi",item.id)} / {@html GetHighlightedString(index, "pr",item.id)}</div>
                        <div class="cells-list">
                            {#each Object.entries(item.cells) as [cellName, count]}
                                <div class="cell">
                                    <div class="cell-name">{cellName}</div>
                                    <div class="cell-amount">{typeof count !== "number" ? "Cell data error" : ((count) % 1) !== 0 ? count.toFixed(3) : count} {item.unit}</div>
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
        <div class="last-update-bar">{LAST_UPDATE_STRING} <button on:click={ShowUploadModal} on:keydown={ShowUploadModal}>Обновить</button></div>
        <ItemModal bind:ToggleModal={ToggleModal} bind:details={modalItem} />
        <UploadModal bind:Toggle={ToggleUploadModal} bind:this={UPLOAD_MODAL} />
    {/if}
    <MapModal />
    <TrayTooltip bind:AddMessage={AddMessage} />
    <span class="highlight" style="display: none;">placeholder</span>
</main>

<style>
    .search-term,
    .items-count,
    .search-bar input,
    .search-bar-clear-btn,
    .item{
        filter: drop-shadow(2px 2px 0 black);
    }
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
    .last-update-bar{
        font-size: 0.8rem;
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 10px;
        row-gap: 2px;
        border-top: 1px solid black;
    }
    /*  */
    main{
        display: flex;
        flex-direction: column;
        height: 100%;
        font-size: 1rem;
    }

    .search-bar .text{
        margin-right: 2px;
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
    .search-bar-clear-btn{
        cursor: pointer;
        border: 1px solid black;
        margin: 0 2px;
        padding: 2px;
        border-radius: 5px;
    }

    .search-bar-clear-btn{
        cursor: pointer;
        border: 1px solid black;
        margin: 0 4px;
        padding: 2px;
        border-radius: 5px;
        background-color: white;
    }

    .status-bar{
        display: flex;
        background-color: white;
        border-bottom: 1px solid black;
        gap: 10px;
        margin: 5px 0;
        padding: 4px 0;
        flex-wrap: wrap;
        row-gap: 5px;
    }
    .items-count{
        background-color: white;
        border: 1px solid black;
        padding: 2px;
    }

    .search-term{
        border: 1px solid black;
        padding: 2px;
        border-radius: 5px;
    }
    .search-term.include{
        background-color: lightgreen;
    }
    .search-term.exclude{
        background-color: lightcoral;
    }
    
    .list{
        /* border: 1px solid blue; */
        flex: 1;
        overflow: hidden;
        overflow-y: auto;
        min-height: 0;
        position: relative;
    }

    .item{
        border: 1px solid black;
        display: flex;
        padding: 5px;
        margin: 5px;
        border-radius: 10px;
    }
    .item.even{
        background-color: #fff0e6;
    }
    .item.odd{
        background-color: white;
    }
    :global(.highlight){
        background-color: lightgreen;
    }
    /* .item.odd{
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
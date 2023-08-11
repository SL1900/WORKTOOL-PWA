<script lang="ts">
	import { onMount } from "svelte";
	import TrayTooltip from "../components/TrayTooltip.svelte";
	import ItemModal from "../components/ItemModal.svelte";
	import MapModal from "../components/MapModal.svelte";
    import UploadModal from "../components/UploadModal.svelte";
	import Paginator from "../components/Paginator.svelte";
	import FeedbackModal from "../components/FeedbackModal.svelte";
	import AccountModal from "../components/AccountModal.svelte";
	import { get } from "svelte/store";
	import { currentUserSecret } from "../stores";
	import { PUBLIC_DATA_URL } from "$env/static/public";
	import { browser } from "$app/environment";

    let AddMessage : (message: string) => void;
    let ToggleFeedbackModal : (state?: boolean) => void;
    let ToggleAccountModal : (state?: boolean) => void;
    let ToggleUploadModal : (state : boolean) => void;
    let ToggleModal : (state?: boolean) => void;
    let modalItem: App.ItemData;

    const SORT_OPTIONS = {
        index: "Индекс",
        name: "Имя",
        nsi: "НСИ",
        cells: "Ячейка"
    };

    let SELECTED_SORT_OPTION : keyof typeof SORT_OPTIONS;

    let PAGE_LIMIT = 25;

    let CURRENT_PAGE = 1;
    $: MAX_PAGES = Math.ceil(filteredItems.length / PAGE_LIMIT);
    $:{
        MAX_PAGES;
        if(CURRENT_PAGE > MAX_PAGES && MAX_PAGES > 0) CURRENT_PAGE = MAX_PAGES;
    }

    let LAST_UPDATE : number = 0;
    let LAST_UPDATE_STRING : string = "";

    let data : App.DataFile = {};
    let items: App.ItemData[] = [];
    let filteredItems : App.ItemData[] = [];

    let search_string = "";

    let INITIAL_LOADING = true;
    let RESULTS_FROM_STORAGE = false;

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
        SELECTED_SORT_OPTION;
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
                        let matches = item[field as typeof Fields[number]].toLowerCase().split(new RegExp(`(${term.toLowerCase()})`));
                        let indexes = [];
                        let index = 0;
                        for(let i = 0; i < matches.length; i++)
                        {
                            if(matches[i] === term.toLowerCase()) filteredResult[item_index].highlights[field as "name" | "nsi" | "pr"].push([index,term.length]);
                            index = index + matches[i].length;
                        }
                        // let term_index = item[field as typeof Fields[number]].toLowerCase().indexOf(term.toLowerCase());
                        // filteredResult[item_index].highlights[field as "name" | "nsi" | "pr"].push([term_index, term.length]);
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
        // filteredItems = filteredResult;
        filteredItems = filteredResult.sort(SortBehaviour);
    }

    function SortBehaviour(a: App.ItemData, b: App.ItemData)
    {
        let result:number = -1;

        switch(SELECTED_SORT_OPTION)
        {
            case "name":
            case "nsi":
                result = a[SELECTED_SORT_OPTION].localeCompare(b[SELECTED_SORT_OPTION]);
                break;
            case "cells":
                result = Object.entries(a.cells)[0].toString().localeCompare(Object.entries(a.cells)[0].toString());
                break;
            case "index":
                break;
        }
        return result;
    }

    onMount( async ()=>{
        if(browser){
            screen.orientation.lock("portrait");
        }

        CheckLoginStatus();

        let accessKey = "";

        if(browser)
        {
            //
            while(true){
                console.log("Loop")
                // if(localStorage.getItem("accessKey"))
                // {
                //     let preCheckResponse = await fetch(PUBLIC_DATA_URL + "/accessCheck",{method: "POST",headers:{"Content-Type": "application/json"},body: JSON.stringify({accessKey: localStorage.getItem("accessKey")})});
                //     let preResponse_json = await preCheckResponse.json();
                //     if(preResponse_json.status == "error") localStorage.removeItem("accessKey");
                // }

                let answer = window.prompt("Код доступа") as string;
                let checkResponse = await fetch(PUBLIC_DATA_URL + "/accessCheck",{method: "POST",headers:{"Content-Type": "application/json"},body: JSON.stringify({accessKey: answer})});
                let response_json = await checkResponse.json();
                if(response_json.status != "error"){ accessKey = answer; localStorage.setItem("accessKey", accessKey); break;}
            } 
        }

        try {
            //
            if(!localStorage.getItem("accessKey")){
                localStorage.setItem("data_string",JSON.stringify({
                    "10000000000": {
                        "name": "Работа приложения приостановлена",
                        "pr": "",
                        "nsi": "",
                        "unit": "шт",
                        "cells": {
                            "0": 1
                        }
                    }
                }));
            }
            let data_string = localStorage.getItem("data_string");
            if(!data_string) throw new Error("No data saved");

            data = JSON.parse(data_string);

            LAST_UPDATE = Number.parseInt(localStorage.getItem("last_update") as string);
            LAST_UPDATE_STRING = GetLastUpdateString(LAST_UPDATE);

            RESULTS_FROM_STORAGE = true;
            INITIAL_LOADING = false;
            console.log("Loaded from storage");
        } catch (error) {
            //
        }
        //
        try
        {
            if(!accessKey) accessKey = localStorage.getItem("accessKey") as string;
            let items_data = await fetch( PUBLIC_DATA_URL + "/download" + "?accessKey=" + accessKey,{
                method: "GET",
                headers:{
                    "Accept-Encoding": "gzip, compress, br"
                }
            });
            let items_data_json = await items_data.json();
            if(items_data_json.status == "error") throw new Error("Data error");
            data = items_data_json;
            let last_update = await fetch( PUBLIC_DATA_URL + "/last_update");
            LAST_UPDATE = (await last_update.json()).timestamp;
            LAST_UPDATE_STRING = GetLastUpdateString(LAST_UPDATE);

            localStorage.setItem("data_string",JSON.stringify(data));
            localStorage.setItem("last_update", LAST_UPDATE.toString());

            setInterval(()=>{
                LAST_UPDATE_STRING = GetLastUpdateString(LAST_UPDATE);
            },5000);
            RESULTS_FROM_STORAGE = false;
            INITIAL_LOADING = false;
        }
        catch(error)
        {
            console.log(error);
        }
        //
    });

    function CheckLoginStatus()
    {
        return !!get(currentUserSecret);
    }

    function ItemSelect(this: HTMLElement, event: KeyboardEvent | MouseEvent)
    {
        // let item_id : string = this.getAttribute("data-id") as string;
        // modalItem = data[item_id as keyof typeof data];
        // ToggleModal(true);
    }
    function ClearSearch()
    {
        search_string = "";
        SEARCH_INPUT_ELEMENT.focus();
    }
    function GetHighlightedString(item : App.ItemData,field: "name" | "nsi" | "pr", item_id: string)
    {
        let merged_highlights = [];
        let highlights = item.highlights[field];
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

        let result_string = item[field]
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
    function ShowFeedbackModal()
    {
        ToggleFeedbackModal(true);
    }
    function ShowAccountModal()
    {
        ToggleAccountModal(true);
    }

    function SwitchPage(target: number, exact?: boolean)
    {
        if(exact) CURRENT_PAGE = target;
        else CURRENT_PAGE += target;

        if(CURRENT_PAGE < 1) CURRENT_PAGE = 1;
        if(CURRENT_PAGE > MAX_PAGES) CURRENT_PAGE = MAX_PAGES;

        //
        document.querySelector(".list")?.scrollTo({ top: 0, behavior: 'smooth' });
    }
</script>

<svelte:head>
    <title>Поиск ТМЦ</title> 
</svelte:head>

<main>
    <!--  -->
    {#if INITIAL_LOADING}
        <!--  -->
        <div class="loading-page">
            ЗАГРУЗКА...
        </div>
    {:else}
        <div class="navbar">
            <div class="title">Поиск ТМЦ</div>
            <div class="nav-btns">
                <div class="account-icon" on:click={ShowAccountModal} on:keydown={ShowAccountModal}>
                    <img src="avatar-blank.svg" alt="Avatar blank">
                </div>
            </div>
        </div>
        <div class="search-bar">
            <div class="text">Поиск:</div>
            <input type="text" bind:this={SEARCH_INPUT_ELEMENT} bind:value={search_string}>
            <div class="search-bar-clear-btn" on:click={ClearSearch} on:keydown={ClearSearch}>Очистить</div>
        </div>
        <div class="status-bar">
            <div class="items-count">Результатов: {filteredItems.length} шт. {RESULTS_FROM_STORAGE ? " [Cached]" : ""}</div>
            {#each SEARCH_TERMS as term}
                <div class="search-term {term.exclude ? "exclude" : "include"}">{term.text}</div>
            {/each}
            <div class="options">
                <select name="" id="" class="sort_options" bind:value={SELECTED_SORT_OPTION}>
                    {#each Object.entries(SORT_OPTIONS) as [option, text]}
                        <option value="{option}">{text}</option>
                    {/each}
                </select>
            </div>
        </div>
        <div class="list">
            <!--  -->
            {#each filteredItems.slice(PAGE_LIMIT * (CURRENT_PAGE - 1), PAGE_LIMIT * CURRENT_PAGE) as item, index}
                <div class="item { index % 2 ? "odd" : "even"}" on:click={ItemSelect} on:keydown={ItemSelect} data-id="{item.id}">
                    <div class="details">
                        <div class="name">{@html GetHighlightedString(item, "name",item.id)}</div>
                        <div class="nsi-pr">{@html GetHighlightedString(item, "nsi",item.id)} / {@html GetHighlightedString(item, "pr",item.id)}</div>
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
        <div class="last-update-bar">
            <Paginator bind:current={CURRENT_PAGE} bind:max={MAX_PAGES} callback={SwitchPage}/>
            {LAST_UPDATE_STRING} 
            <!-- <button on:click={ShowUploadModal} on:keydown={ShowUploadModal}>Обновить</button> -->
            <button on:click={ShowFeedbackModal} on:keydown={ShowFeedbackModal}>Предложения</button>
        </div>
        <ItemModal bind:ToggleModal={ToggleModal} bind:details={modalItem} />
        <UploadModal bind:Toggle={ToggleUploadModal} bind:this={UPLOAD_MODAL} />
        <FeedbackModal bind:ToggleModal={ToggleFeedbackModal} />
        <AccountModal bind:ToggleModal={ToggleAccountModal} />
    {/if}
    <MapModal />
    <TrayTooltip bind:AddMessage={AddMessage} />
    <span class="highlight" style="display: none;">placeholder</span>
</main>

<style>
    .navbar{
        display: flex;
        border-bottom: 1px solid black;
        padding: 5px;
        align-items: center;
        font-size: 1.25rem;
        text-transform: uppercase;
        font-family: 'Courier New', Courier, monospace;
        font-weight: 600;
    }
    .navbar .title{
        flex: 1;
    }
    .nav-btns{
        display: flex;
        float: right;
        height: 4vh;
    }

    .account-icon{
        cursor: pointer;
    }
    .account-icon,
    .account-icon img{
        height: 100%;
        border-radius: 50%;

    }
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
        padding: 2px;
        font-size: 0.8rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
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
        /* border-bottom: 1px solid black; */
        padding-top: 5px;
        justify-content: center;
    }
    .search-bar input{
        flex: 1;
        background-color: white;
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

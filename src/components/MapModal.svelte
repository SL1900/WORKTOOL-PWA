<script lang="ts">
	import { onMount } from "svelte";
	import { descriptors } from "./MapDescriptors";

    let modal_show: boolean = false;
    // 
    let list : App.ItemData[] = [
        {
            name: "Test 1",
            nsi: "001",
            pr: "",
            unit: "pcs",
            highlights: {name: [], nsi: [], pr: []},
            id: "id_001",
            cells: {
                "П01-B0A-01-01-01": 2
            }
        },
        {
            name: "Test 2",
            nsi: "002",
            pr: "",
            unit: "pcs",
            highlights: {name: [], nsi: [], pr: []},
            id: "id_002",
            cells: {
                "П01-B0A-01-01-01": 4,
                "П02-B0A-01-01-01": 2
            }
        },
        {
            name: "Test 3",
            nsi: "003",
            pr: "",
            unit: "pcs",
            highlights: {name: [], nsi: [], pr: []},
            id: "id_003",
            cells: {
                "П02-B0A-01-01-01": 2,
                "П03-B0A-01-01-01": 2
            }
        },
    ];


    let Areas : App.AreasType = {
        "П01":{
            name: "Склад 1",
            key: "П01",
            items: []
        },
        "П02":{
            name: "Склад 2",
            key: "П02",
            items: []
        },
        "П03":{
            name: "Склад 3",
            key: "П03",
            items: []
        },
        "П04":{
            name: "Склад 4",
            key: "П04",
            items: []
        },
    }

    function UpdateMaps()
    {
        let area_name : keyof typeof Areas;
        for(area_name in Areas)
        {
            Areas[area_name].items = [];
        }
        
        for(let item of list)
        {
            for(let cell of Object.entries(item.cells))
            {
                let cell_name = cell[0];
                let cell_amount = cell[1] as number;

                area_name = cell_name.match(/(\d|[А-Яа-я])+/ig)?.[0] as keyof typeof Areas || "П01";

                Areas[area_name].items.push({name: item.name, amount: cell_amount});
            }
        }

        for(area_name in Areas)
        {
            //
            let area_canvas = document.querySelector(`[data-canvas-id="${area_name}"]`) as HTMLCanvasElement;
            if(!area_canvas) continue;

            let ctx = area_canvas.getContext("2d") as CanvasRenderingContext2D;

            area_canvas.width = (area_canvas.parentElement?.parentElement?.offsetWidth || 400) * 0.8;
            area_canvas.height = (area_canvas.parentElement?.parentElement?.offsetHeight || 400) * 0.8;

            let maxX = 0;
            let maxY = 0;

            for(let item of descriptors[area_name].items)
            {
                for(let i = 0; i < item.coords.length; i++)
                {
                    let [x,y] = item.coords[i];
                    maxX = maxX < x ? x : maxX;
                    maxY = maxY < y ? y : maxY;
                }
            }
            
            let unitX = area_canvas.width / maxX;
            let unitY = area_canvas.height / maxY;

            for(let item of descriptors[area_name].items)
            {
                let x: number = 0;
                let y: number = 0;

                let item_sum_x = 0;
                let item_sum_y = 0;

                let min_x = 1000000;
                let min_y = 1000000;

                let max_x = 0;
                let max_y = 0;

                [x,y] = item.coords[0];

                min_x = min_x > x ? x : min_x;
                min_y = min_y > y ? y : min_y;

                max_x = max_x < x ? x : max_x;
                max_y = max_y < y ? y : max_y;

                item_sum_x += x;
                item_sum_y += y;

                ctx?.beginPath();
                ctx?.moveTo(x*unitX,y*unitY);

                for(let i = 1; i < item.coords.length; i++)
                {
                    [x,y] = item.coords[i];

                    min_x = min_x > x ? x : min_x;
                    min_y = min_y > y ? y : min_y;

                    max_x = max_x < x ? x : max_x;
                    max_y = max_y < y ? y : max_y;

                    ctx?.lineTo(x*unitX,y*unitY);
                    item_sum_x += x;
                    item_sum_y += y;
                }
                [x,y] = item.coords[0];
                ctx?.lineTo(x*unitX,y*unitY);
                ctx.strokeStyle = "red";
                ctx?.stroke();

                ctx.fillStyle = "blue";

                let label_x = 0;
                let label_y = 0;
                let text_align: CanvasTextAlign = "center";
                
                switch(item.label_align)
                {
                    case "bottom":
                        label_x = item_sum_x / item.coords.length * unitX;
                        label_y = max_y * unitY;
                        break;
                    case "left":
                        label_x = min_x * unitX;
                        label_y = item_sum_y / item.coords.length * unitY;
                        text_align = "right";
                        break;
                    case "right":
                        label_x = max_x * unitX;
                        label_y = item_sum_y / item.coords.length * unitY;
                        text_align = "left";
                        break;
                    case "top":
                        label_x = item_sum_x / item.coords.length * unitX;
                        label_y = min_y * unitY;
                        break;
                    case "center":
                        label_x = item_sum_x / item.coords.length * unitX;
                        label_y = item_sum_y / item.coords.length * unitY;
                        break;
                    default:
                        return;
                }
                ctx.textAlign = text_align;
                ctx.fillText(item.name, label_x, label_y);
                console.log(item.name, label_x);
            }
        }
    }

    onMount(()=>{
        UpdateMaps();
    });
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
</script>

<main on:click={CloseModal} on:keydown={CloseModal} style="display: {modal_show ? "flex" : "none"};">
    <!--  -->
    <div class="body" on:click={StopProp} on:keydown={StopProp}>
        <div class="areas">
            <!--  -->
            {#each Object.entries(Areas) as [area_name, details]}
                <div class="area">
                    <div class="name">{area_name}</div>
                    <div class="items">
                        {#each details.items as item}
                        <div class="item">
                            <div class="item-name">{item.name}</div>
                            <div class="item-amount">{item.amount}</div>
                        </div>
                        {/each}
                    </div>
                    <canvas data-canvas-id="{area_name}"></canvas>
                </div>
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
    }

    .areas{
        display: flex;
        flex-direction: column;
    }
    .area{
        border: 1px solid black;
    }
    .area canvas{
        border: 1px solid gray;
        margin: 2px;
    }

    .item{
        display: flex;
        gap: 10px;
    }
</style>
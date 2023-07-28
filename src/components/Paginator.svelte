<script lang="ts">
    // 
    export let max = 0;
    export let current = 0;
    export let callback: (direction: number) => void;

    function PrevPage()
    {
        callback(-1);
    }
    function NextPage()
    {
        callback(1);
    }
</script>

<main>
    <!--  -->
    <button class="prev-btn {current == 1 ? "hidden" : ""}" on:click={PrevPage}><img src = "ArrowRight.svg" alt="Arrow Right"/></button>
    <div class="state">{current} / {max}</div>
    <button class="next-btn {current == max ? "hidden" : ""}" on:click={NextPage}><img src = "ArrowRight.svg" alt="Arrow Right"/></button>
</main>

<style>
    /*  */
    main{
        display: flex;
        align-items: center;
        gap: 2px;
    }
    button{
        width: 2rem;
        height: 2rem;
    }
    .next-btn img{
        width: 100%;
        height: 100%;
    }
    .prev-btn img{
        width: 100%;
        height: 100%;
        transform: rotate(180deg);
    }
    .hidden{
        opacity: 0;
    }
</style>
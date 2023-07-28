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
    <button on:click={PrevPage}>Prev</button>
    <div class="state">{current} / {max}</div>
    <button on:click={NextPage}>Next</button>
</main>

<style>
    /*  */
</style>
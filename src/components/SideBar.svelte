<script lang="ts">
    // 
    export let Actions : App.SideBarItem[];
</script>

<main>
    <!--  -->
    {#each Actions as action}
        {action.text}
    {/each}
</main>

<style>
    /*  */
</style>
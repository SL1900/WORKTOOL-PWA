<script>
import {PUBLIC_DATA_URL} from "$env/static/public";

let uploaded = false;
let uploading = false;

async function change(e)
{
    uploading = true;
let file = e.target.files[0];
let data = new FormData();
data.append("file", file);
await fetch(PUBLIC_DATA_URL + "/upload" , {
    method: "POST", 
    body: data 
});
uploading = false;
uploaded = true;
}
</script>

<main>
<input type="file" on:change={(e)=>change(e)}>
{#if uploading}UPLOADING. . .  {/if}
{#if uploaded}Uploaded! ! ! {/if}
</main>
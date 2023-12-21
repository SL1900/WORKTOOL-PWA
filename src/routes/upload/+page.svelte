<script>
import {PUBLIC_DATA_URL} from "$env/static/public";
async function change(e)
{
let file = e.target.files[0];
let data = new FormData();
data.append("file", file);
await fetch(PUBLIC_DATA_URL + "/upload" , {
    method: "POST", 
    body: data 
});
}
</script>

<main>
<input type="file" on:change={(e)=>change(e)}>
</main>
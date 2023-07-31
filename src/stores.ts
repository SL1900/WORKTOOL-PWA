import { browser } from "$app/environment";
import { writable, readable, type Writable } from "svelte/store";

export const currentUserSecret = writable<string>();
export const AppAccessToken  = writable<string>();
export const currentUserInfo = writable<App.AccountInfo|null>();


MakePersistent(currentUserSecret, "secretToken");
MakePersistent(AppAccessToken, "appAccessToken");
MakePersistent(currentUserInfo, "userInfo");

function MakePersistent(store: Writable<string|App.AccountInfo|null>,localstorageKey: string)
{
    let interval = setInterval(()=>{
        //
        if(browser)
        {
            if(localstorageKey == "userInfo") store.set(JSON.parse(localStorage.getItem(localstorageKey) || "{}"));
            else store.set(localStorage.getItem(localstorageKey) || "");
    
            store.subscribe( (value) => {
                if(typeof value != "string") value = JSON.stringify(value);
                localStorage.setItem(localstorageKey, value);
            });
            clearInterval(interval);
        }
    },100);
}
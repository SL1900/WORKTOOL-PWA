<script lang="ts">
	import { get } from "svelte/store";
	import { onMount } from "svelte";
	import { currentUserInfo, currentUserSecret } from "../stores";
	import { PUBLIC_DATA_URL } from "$env/static/public";

    // 
    let modal_show: boolean = false;

    $: logged_in = !!get(currentUserSecret);

    let username_input: string;
    let password_input: string;

    let login_attempt_active = false;
    let login_attempt_status = "";

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

    async function Login()
    {
        // 
        login_attempt_active = true;
        login_attempt_status = "";

        let response = await fetch(PUBLIC_DATA_URL + "/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username_input,
                password: password_input
            })
        });
        let response_data = await response.json();
        if(response_data.status == "error")
        {
            login_attempt_status = response_data.message;
        }
        login_attempt_active = false;

        if(response_data.status == "ok")
        {
            logged_in = true;
            currentUserSecret.set(response_data.credentials);
            currentUserInfo.set({
                username: username_input,
                displayName: "",
                secret: response_data.credentials
            });
            UpdateUserDetails();
        }
    }

    function Logout()
    {
        // 
        currentUserSecret.set("");
        logged_in = false;
    }

    function PasswordInputKeydown(event: KeyboardEvent)
    {
        // 
        if(event.code === "Enter" || event.code === "NumpadEnter" || event.key === "Enter")
        {
            Login();
        }
    }

    export async function UpdateUserDetails()
    {
        //
        let response = await fetch(PUBLIC_DATA_URL + "/get_user_data",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: get(currentUserInfo)?.username,
                secret: get(currentUserSecret)
            })
        });
        let user_data = await response.json();
        currentUserInfo.update( (current) => {
            return {...current as App.AccountInfo, displayName: user_data.displayName};
        })
    }

    onMount(()=>{
        setTimeout(() => {
            if(!!get(currentUserSecret))
            {
                logged_in = true;
                UpdateUserDetails();
            }
        }, 500);
    })
</script>

<main on:click={CloseModal} on:keydown={CloseModal} style="display: {modal_show ? "flex" : "none"};">
    <div class="body" on:click={StopProp} on:keydown={StopProp}>
        <!--  -->
        {#if logged_in}
            <div class="title">Account</div>
            <div class="user-details">
                {#if $currentUserInfo}
                    <div class="display-name-title">{$currentUserInfo.displayName || "..."}</div>
                    <div class="username-title">{$currentUserInfo.username}</div>
                {:else}
                    <div class="loader">Loading...</div>
                {/if}
            </div>
            <button class="logout-btn" on:click={Logout} on:keydown={Logout}>Log Out</button>    
        {:else}
            <div class="title">Login</div>
            <div class="login-form">
                <div class="username-row">
                    <div class="text">Username:</div>
                    <input type="text" bind:value={username_input}>
                </div>
                <div class="password-row">
                    <div class="text">Password:</div>
                    <input type="text" bind:value={password_input} on:keydown={PasswordInputKeydown}>
                </div>
                <button class="login-btn" on:click={Login} on:keydown={Login} disabled='{login_attempt_active}'>Login</button>
                <div class="login-attempt-status" style="display: {login_attempt_status.length ? "flex" : "none"};">{login_attempt_status}</div>
            </div>
        {/if}
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
        align-items: center;
        justify-content: space-between;
        padding: 10px;
        border: 1px solid black;
        filter: drop-shadow(1px 1px 5px) drop-shadow(-1px -1px 5px);
        overflow-y: scroll;
        overflow-x: hidden;
        box-sizing: border-box;
        position: relative;
    }

    .title{
        display: flex;
        justify-content: center;
        font-size: 2rem;
    }
    
    .login-form{
        display: flex;
        flex: 1;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 5px;
    }
    .login-form .text{
        font-size: 0.75rem;
    }

    .login-btn{
        font-size: 1.5rem;
        text-transform: uppercase;
        font-family: 'Courier New', Courier, monospace;
        font-weight: 600;
    }

    .user-details{
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: 1.25rem;
    }
</style>
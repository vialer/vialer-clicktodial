import request from '/lib/request.mjs';

export async function getContact(){
    const colleagueList = await request('contacts', );
    return colleagueList;
    
}
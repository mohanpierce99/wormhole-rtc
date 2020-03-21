
function add (lanobj,branch,node){
    if(lanobj[branch]==null){
        lanobj[branch]=node;
        node.prev=null;
        node.next=null;
    }else{
        lanobj[branch].prev=node;
        node.next=lanobj[branch];
        lanobj[branch]=node;
    }
}


function search(lanobj,callback,query){

    query = (query != null)? [query]:["transceiver","receiver"];
    query.forEach((x)=>{

        let obj=lanobj[x];
        while(obj!=null){
            callback(obj);
            obj=obj.next;
        }
    });
}

function del(lanobj,branch,node){
    if(node.next != null){
        node.next.prev = node.prev;
        if(node.prev == null){
            lanobj[branch] = node.next;
        }else{
            node.prev.next = node.next;
        }
    }else{
        if(node.prev == null){
            lanobj[branch] = null;
        }else{
            node.prev.next = null;
        }
    }
}

module.exports={add,del,search};
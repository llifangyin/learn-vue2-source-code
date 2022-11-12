export function foreach(obj,cb){
    Object.keys(obj).forEach(key=>{
        cb(key,obj[key])
    })
}
// {a:1} => a 1
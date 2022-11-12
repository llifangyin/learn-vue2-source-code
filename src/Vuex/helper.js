
// 辅助函数实现
export function mapState(stateArr){
    let obj = {}
    for(let i = 0;i<stateArr.length;i++){
        let stateName = stateArr[i]
        obj[stateName] = function(data){
            return this.$store.state[stateName]
        }
    }
    return obj
}
export function mapGetters(getterArr){
    let obj = {}
    for(let i = 0;i<getterArr.length;i++){
        let gettersName = getterArr[i]
        obj[gettersName] = function(data){
            return this.$store.getters[gettersName]
        }
    }
    return obj
}

export function mapMutations(mutationsArr){
    let obj = {}
    for(let i = 0;i<mutationsArr.length;i++){
        let mutationsName = mutationsArr[i]
        obj[mutationsName] = function(data){
            return this.$store.commit(mutationsName,data)
        }
    }
    return obj 
}

export function mapActions(actionsArr){
    let obj = {}
    for(let i = 0;i<actionsArr.length;i++){
        let type = actionsArr[i]
        obj[type] = function(data){
            return this.$store.dispatch(type,data)
        }
    }
    return obj 
}
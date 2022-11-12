// 该demo在vue全家桶模式下注释掉import vuex换成本路径使用
import { Store } from "./store"
import { install } from "./mixin"
export * from './helper'
export default {
    Store,
    install,
    // mapState,
    // mapGetters
}
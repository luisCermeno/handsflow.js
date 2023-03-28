export default class Record{
  constructor(ids) {
    var mp = {}
    for(const id in ids){
      mp[id] = null
    }
  }
}
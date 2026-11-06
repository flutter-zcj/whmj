import major from '../constant/Major.js'
import minor from '../constant/Minor.js'

/**
 * 修改记录:
 * 24-07-04     郑朝军
 */

/**
 * Api
 * ZGIS：常用API
 *
 * @class
 * @memberof    Api
 */
class Api
{
  /**
   * 取分管部门信息
   * @static
   * @method
   * @param   {Number}    userid      用户ID
   * @returns {Promise}
   */
  static getDepAdms(userid)
  {
    // 取分管部门
    let params =
    {
      // SELECT da.* from userdep ud,oa_depadm da where ud.organid=da.id0 and ud.userid=39
      _major: major.SYS,
      _minor: cx.consts.TAB_USERDEP,
      tables: 'ud;da:' + major.OA + ',' + minor.OA_DEPADM,
      _exp: 'ud.organid=da.id0 AND ud.userid=?',
      cols: 'ud:organname;da:*',
      types: 'i',
      vals: userid
    }
    return cx.svr.area.queryUnion(params)
      .then((ret) =>
      {
        $g.depadm = ret
        return ret
      })
  }
}
export default Api

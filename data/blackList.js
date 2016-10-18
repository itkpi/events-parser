'use strict'

const _log_ = require('../utils.js')._log_

const inTitle = new RegExp(process.env.BAN_IN_TITLE ||
_log_('Not found eviroment variable BAN_IN_TITLE', 'blackList') || 'Default variable', 'i')

const inTitleOrAgenda = new RegExp(process.env.BAN_IN_TITLE_OR_AGENDA ||
_log_('Not found eviroment variable BAN_IN_TITLE_OR_AGENDA', 'blackList') || 'Default variable', 'i')

const courseTitle = new RegExp(process.env.BAN_COURSE_TITLE ||
_log_('Not found eviroment variable BAN_COURSE_TITLE', 'blackList') || 'Default variable', 'i')

const courseCompany = new RegExp(process.env.BAN_COURSE_COMPANY ||
_log_('Not found eviroment variable BAN_COURSE_COMPANY', 'blackList') || 'Default variable', 'i')

exports.inBlackList = (title, agenda, time, banInfo) => {
  // 0 == false, if str.search('s') not found 's' - return -1
  const giveFalse = 1

  const evnt = new Date(time)
  const now = new Date()
  const mm = now.getMonth()
  let dd = now.getDate()

  if (mm !== evnt.getMonth()) dd -= now.daysInMonth()

  if (evnt.getDate() - evnt.getUTCDay() - dd < 0) {
    _log_(`Time (${time}): ${banInfo}\n`, 'blackList')

    return true
  }

  if (title.search(inTitle) + giveFalse) {
    _log_(`inTitle: ${banInfo}\n`, 'blackList')

    return true
  }
  if (title.search(inTitleOrAgenda) + giveFalse) {
    _log_(`inTitleOrAgenda (Title): ${banInfo}\n`, 'blackList')

    return true
  }
  if (agenda.search(inTitleOrAgenda) + giveFalse) {
    _log_(`inTitleOrAgenda (Agenda): ${banInfo}\n`, 'blackList')

    return true
  }
  if (title.search(courseTitle) + giveFalse &&
      agenda.search(courseCompany) + giveFalse) {
    _log_(`Course: ${banInfo}\n`, 'blackList')

    return true
  }

  return false
}

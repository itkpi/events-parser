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

exports.inBlackList = (title, agenda, banInfo) => {
  if (title.search(inTitle) + 1) {
    _log_(`inTitle: ${banInfo}\n`, 'blackList')

    return true
  }
  if (title.search(inTitleOrAgenda) + 1) {
    _log_(`inTitleOrAgenda (Title): ${banInfo}\n`, 'blackList')

    return true
  }
  if (agenda.search(inTitleOrAgenda) + 1) {
    _log_(`inTitleOrAgenda (Agenda): ${banInfo}\n`, 'blackList')

    return true
  }
  if (title.search(courseTitle) + 1 &&
      agenda.search(courseCompany) + 1) {
    _log_(`Course: ${banInfo}\n`, 'blackList')

    return true
  }

  return false
}

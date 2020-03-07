class SolveCrossDomainMiddleware(object):
    def process_response(self, req, res):
        res['Access-Control-Allow-Origin'] = '*'
        res['Access-Control-Allow-Headers'] = 'Content-Type'
        return res
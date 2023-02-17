import { saveInLocalStorage } from '@/functions/app.ts';

class LoggerUtil {

	constructor(prefix, style){
		this.prefix = prefix
		this.style = style
	}

	log(){
		console.log.apply(null, [this.prefix, this.style, ...arguments])
	}

	info(){
		console.info.apply(null, [this.prefix, this.style, ...arguments])
	}

	warn(){
		console.warn.apply(null, [this.prefix, this.style, ...arguments])
	}

	debug(){
		console.debug.apply(null, [this.prefix, this.style, ...arguments])
	}

	error(){
		console.error.apply(null, [this.prefix, this.style, ...arguments])
	}

}

function createLogger(prefix, style = null){
	return new LoggerUtil(prefix, style)
}

export default createLogger;
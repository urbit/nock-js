var BigInteger = require('jsbn').BigInteger;

function Noun() {
  this._mug = 0;
}

Noun.prototype.mug = function () {
  if ( 0 === this._mug ) {
    this._mug = this.calculateMug();
  }
  return this._mug;
};

Noun.prototype.mugged = function () {
  return 0 !== this._mug;
};

Noun.prototype.equals = function(o) {
  if ( this === o ) {
    return true;
  }

  if ( this instanceof Cell ) {
    if ( o instanceof Cell) {
      return this.unify(o);
    }
    else {
      return false;
    }
  }
  else {
    if ( o instanceof Cell ) {
      return false;
    }
    else if (0 === this.number.compareTo(o.number)) {
      o.number = this.number;
      return true;
    }
    else {
      return false;
    }
  }
};


function _mug_fnv(has_w) {
  return Math.imul(has_w, 16777619);
}

function _mug_out(has_w) {
  return (has_w >>> 31) ^ (has_w & 0x7fffffff);
}

function _mug_both(lef_w, rit_w) {
  var bot_w = _mug_fnv(lef_w ^ _mug_fnv(rit_w));
  var out_w = _mug_out(bot_w);

  if ( 0 != out_w ) {
    return out_w;
  }
  else {
    return _mug_both(lef_w, ++rit_w);
  }
}

function Cell(head, tail) {
  Noun.call(this);
  this.head = head;
  this.tail = tail;
}
Cell.prototype = Object.create(Noun.prototype);
Cell.prototype.constructor = Cell;

Cell.prototype.calculateMug = function() {
  return _mug_both(this.head.mug(), this.tail.mug());
};

Cell.prototype.unify = function(o) {
  if ( this === o ) {
    return true;
  }

  if ( o.mugged() ) {
    if ( this.mugged() ) {
      if ( this.mug() != o.mug() ) {
        return false;
      }
    }
    else {
      return o.unify(this);
    }
  }

  if ( this.head.equals(o.head) ) {
    o.head = this.head;
    if ( this.tail.equals(o.tail) ) {
      o._mug = this._mug;
      o.tail = this.tail;
      return true;
    }
  }

  return false;
};

function Atom(number) {
  Noun.call(this);
  this.number = number;
}
Atom.prototype = Object.create(Noun.prototype);
Atom.prototype.constructor = Atom;

Atom.prototype.calculateMug = function() {
	var a = this.number.toByteArray();
	var b, c, d, e, f, bot;
	for ( e = a.length - 1, b = (2166136261|0); ; ++b ) {
    c = b;
    bot = ( 0 === a[0] ) ? 1 : 0;
		for ( d = e; d >= bot; --d ) {
      c = _mug_fnv(c ^ (0xff & a[d]));
		}
    f = _mug_out(c);
    if ( 0 !== f ) {
      return f;
    }
	}
};

function i(num) {
	return new Atom(new BigInteger(num.toString()));
}

function s(str) {
	return new Atom(new BigInteger(str));
}

function m(str) {
  var i, octs = new Array(str.length);
  for ( i = 0, j = octs.length - 1; i < octs.length; ++i, --j ) {
    octs[j] = (str.charCodeAt(i) & 0xff).toString(16);
  }
  return new Atom(new BigInteger(octs.join(''), 16))
}

function dwim(n) {
	if ( n instanceof Noun ) {
		return n;
	}
	if ( typeof n === "number" ) {
		return i(n);
	}
	else if ( Array.isArray(n) ) {
		var cel = new Cell(dwim(n[n.length-2]), dwim(n[n.length-1]));
		for ( var j = n.length-3; j >= 0; --j ) {
			cel = new Cell(dwim(n[j]), cel);
		}
		return cel;
	}
	else if ( typeof n === "string" ) {
    return m(n);
	}
}

Atom.prototype.valueOf = function() {
	return this.number.bitLength() <= 32
		? this.number.intValue()
		: this.number.toString();
};

module.exports = {
	dwim: dwim,
	Noun: Noun,
	Cell: Cell,
	Atom: {
		Atom: Atom,
		yes:  i(0),
		no:   i(1),
    m:    m,
		i:    i,
		s:    s,
	},
};
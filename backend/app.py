from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///inventory.db'
db = SQLAlchemy(app)

class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, default=0)
    category = db.Column(db.String(50))
    price = db.Column(db.Float)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

@app.route('/api/items', methods=['GET'])
def get_items():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('limit', 10, type=int)
    search = request.args.get('search', '')
    
    query = Item.query.filter(
        (Item.name.ilike(f'%{search}%')) | 
        (Item.category.ilike(f'%{search}%'))
    )
    
    pagination = query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        'items': [{
            'id': item.id,
            'name': item.name,
            'quantity': item.quantity,
            'category': item.category,
            'price': item.price,
            'last_updated': item.last_updated.isoformat()
        } for item in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': pagination.page
    })

@app.route('/api/items', methods=['POST'])
def add_item():
    data = request.get_json()
    new_item = Item(
        name=data['name'],
        quantity=data['quantity'],
        category=data['category'],
        price=data['price']
    )
    db.session.add(new_item)
    db.session.commit()
    return jsonify({'message': 'Item created!'}), 201

@app.route('/api/items/<int:id>', methods=['PUT'])
def update_item(id):
    item = Item.query.get_or_404(id)
    data = request.get_json()
    item.name = data['name']
    item.quantity = data['quantity']
    item.category = data['category']
    item.price = data['price']
    item.last_updated = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': 'Item updated!'})

@app.route('/api/items/<int:id>', methods=['DELETE'])
def delete_item(id):
    item = Item.query.get_or_404(id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Item deleted!'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
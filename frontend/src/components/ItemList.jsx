import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Button, TextField, Box, Typography, IconButton, Dialog,
  DialogActions, DialogContent, DialogTitle, Pagination
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import StockChart from './StockChart';

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    category: '',
    price: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    fetchItems();
  }, [pagination.page, searchTerm]);

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/items', {
        params: { 
          search: searchTerm,
          page: pagination.page,
          limit: pagination.limit
        }
      });
      setItems(response.data.items);
      setPagination(prev => ({
        ...prev,
        total: response.data.total,
        pages: response.data.pages
      }));
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await axios.put(`http://localhost:5000/api/items/${editingItem.id}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/items', formData);
      }
      fetchItems();
      setFormData({ name: '', quantity: 0, category: '', price: 0 });
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/items/${itemToDelete}`);
      fetchItems();
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      'Nombre,Cantidad,Categoría,Precio,Última actualización',
      ...items.map(item => 
        `"${item.name}",${item.quantity},${item.category},${item.price},"${new Date(item.last_updated).toLocaleString()}"`
      )].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inventario.csv';
    link.click();
  };

  return (
    <Box sx={{ p: 3 }} className="card-style">
      <Typography variant="h4" gutterBottom className="form-header">
        Gestor de Inventario
      </Typography>

      <Box 
        component="form" 
        onSubmit={handleSubmit} 
        sx={{ mb: 4 }} 
        className="card-style"
      >
        <TextField
          label="Nombre"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
          fullWidth
          margin="normal"
        />
        
        <TextField
          label="Cantidad"
          type="number"
          value={formData.quantity}
          onChange={(e) => setFormData({...formData, quantity: e.target.value})}
          required
          fullWidth
          margin="normal"
        />
        
        <TextField
          label="Categoría"
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          required
          fullWidth
          margin="normal"
        />
        
        <TextField
          label="Precio"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({...formData, price: e.target.value})}
          required
          fullWidth
          margin="normal"
        />
        
        <Button 
          type="submit" 
          variant="contained" 
          color={editingItem ? "success" : "primary"}
          className="custom-button"
          sx={{ mt: 2, mr: 2 }}
        >
          {editingItem ? "Actualizar Item" : "Agregar Item"}
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={exportToCSV}
          className="custom-button"
          sx={{ mt: 2 }}
        >
          Exportar a CSV
        </Button>
      </Box>

      <TextField
        label="Buscar items..."
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Box className="chart-container">
        <StockChart items={items} />
      </Box>

      <TableContainer component={Paper} className="card-style">
        <Table>
          <TableHead className="table-header">
            <TableRow>
              <TableCell className="table-header-cell">Nombre</TableCell>
              <TableCell className="table-header-cell">Cantidad</TableCell>
              <TableCell className="table-header-cell">Categoría</TableCell>
              <TableCell className="table-header-cell">Precio</TableCell>
              <TableCell className="table-header-cell">Última actualización</TableCell>
              <TableCell className="table-header-cell">Acciones</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell 
                  sx={{ 
                    color: item.quantity <= 5 ? 'error.main' : 'inherit',
                    fontWeight: item.quantity <= 5 ? 'bold' : 'normal',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  className={item.quantity <= 5 ? "stock-alert" : ""}
                >
                  {item.quantity}
                  {item.quantity <= 5 && <WarningIcon color="error" sx={{ ml: 1 }} />}
                </TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>${parseFloat(item.price).toFixed(2)}</TableCell>
                <TableCell>
                  {new Date(item.last_updated).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton 
                    color="warning" 
                    onClick={() => {
                      setEditingItem(item);
                      setFormData(item);
                    }}
                    aria-label="editar"
                  >
                    <EditIcon />
                  </IconButton>
                  
                  <IconButton 
                    color="error" 
                    onClick={() => {
                      setItemToDelete(item.id);
                      setDeleteConfirmOpen(true);
                    }}
                    aria-label="eliminar"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={pagination.pages}
          page={pagination.page}
          onChange={(e, page) => setPagination(prev => ({...prev, page}))}
          color="primary"
        />
      </Box>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          ¿Estás seguro de querer eliminar este item permanentemente?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error">Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ItemList;
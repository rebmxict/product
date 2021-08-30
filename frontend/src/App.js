
import React from 'react';
import { useEffect, useState, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';

const useStyles = makeStyles({
  root: {
    maxWidth: '25%',
    minWidth: '25%',
    border: '1px solid #aaa',
    boxSizing: 'border-box'
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: 'white',
    border: '1px solid #000',
    width: '50%',
    padding: '10px 10px 10px 10px'
  },
});

export default function App() {
  const classes = useStyles()
  const fileRef = useRef(null)
  const editRef = useRef(null)
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState([])
  const [product, setProduct] = useState({})
  const [open, setOpen] = useState(0)
  const [confirm, setConfirm] = useState([0, false])
  const [categoryConfirm, setCategoryConfirm] = useState([0, false])
  const [add, setAdd] = useState(false)
  const [addCategory, setAddCategory] = useState([{}, false])
  const [newProduct, setNewProduct] = useState({category: ''})
  const [manageCategory, setManageCategory] = useState(false)
  const [editCategory, setEditCategory] = useState(0)
  const [changedCategory, setChangedCategory] = useState({name: ''})
  const [search, setSearch] = useState({
      category: '',
      name: '',
      vendor: '',
      store: ''
  })
  const [file, setFile] = useState(null)
  const [editfile, setEditFile] = useState(null)

  const fetchAllProducts = async () => {
    const response = await fetch("/product/")
    const fetchedproducts = await response.json()
    setProducts(fetchedproducts)
  }

  const fetchCategory = async () => {
    const response = await fetch("/category/")
    const category = await response.json()
    setCategory(category)
  }

  const refresh = async () => {
    fetchCategory()
    fetchAllProducts()
    setSearch({
        category: '',
        name: '',
        vendor: '',
        store: ''
    })
  }

  useEffect(() => {
    refresh()
  }, [])

  const handleSubmit = async () => {
      const formData = new FormData()
      formData.append('file', editRef.current.files[0])
      Object.keys(product).map((key, index) => {
          if(key !== "file"){
            formData.append(key, product[key])
          }
      })
    //   await fetch(`/product/${product._id}`, {method: 'PUT', body: JSON.stringify(product)})
      await fetch(`/product/${product._id}`, {method: 'PUT', body: formData})
      refresh()
  }

  const handleDelete = async (id) => {
      await fetch(`/product/${id}`, {method: 'DELETE'})
      refresh()
  }

  const handleCreate = async () => {
    const formData = new FormData();
    formData.append('file', fileRef.current.files[0]);
    Object.keys(newProduct).map((key, index) =>{
        formData.append(key, newProduct[key])
    })
    await fetch(`/product/`, {method: 'POST', body: formData})
    refresh()
  }

  const handleCategoryEdit = async () => {
      await fetch(`/category/${category[editCategory - 1]._id}`, {method: 'PUT', body: JSON.stringify(changedCategory)})
      refresh()
  }

  const handleCategoryDelete = async (id) => {
    await fetch(`/category/${id}`, {method: 'DELETE'})
    refresh()
  }

  const handleAddCategory = async () => {
    await fetch(`/category/`, {method: 'POST', body: JSON.stringify(addCategory[0])})
    refresh()
  }

  const handleSearch = async () => {
    const response = await fetch(`/product/search`, {method: 'POST', body: JSON.stringify(search)})
    const result = await response.json()
    setProducts(result)
  }

  return (
    <div style={{margin: '10px 10px 10px 10px'}}>
        <Button 
            style={{marginBottom: "20px", marginRight: '5px'}}
            size="large"
            variant="outlined"
            color="primary"
            onClick={() => {setNewProduct({category: ''});setAdd(true)}}
        >Add New Product</Button>

        <Button
            style={{marginBottom: "20px"}}
            size="large"
            variant="outlined"
            color="primary"
            onClick={() => {setManageCategory(true)}}
        >
            Manage category
        </Button>

        <Typography style={{marginLeft: 20}} variant="h6" component="span">
            Search condition
        </Typography>
        <FormControl style={{minWidth: 120, marginLeft: 20}}>
            <InputLabel>Category</InputLabel>
            <Select size="large" value={search.category && search.category} onChange={(e) => setSearch({...search, category: e.target.value})}>
                <MenuItem value=''>No value</MenuItem>
                {category.map((item, index) => (
                    <MenuItem value={item["_id"]} key={index}>{item.name}</MenuItem>
                ))}
            </Select>
        </FormControl>
        <TextField label="name" value={search.name && search.name} onChange={(e) => setSearch({...search, name: e.target.value})}/>
        <TextField label="vendor" value={search.vendor && search.vendor} onChange={(e) => setSearch({...search, vendor: e.target.value})}/>
        <TextField label="store" value={search.store && search.store} onChange={(e) => setSearch({...search, store: e.target.value})}/>                        
        <Button 
            style={{marginBottom: "20px", marginLeft: '5px'}}
            size="large" 
            variant="outlined"
            color="primary"
            onClick={() => {handleSearch()}}
        >
            Search
        </Button>
        
        <div style={{display: 'flex', flexWrap: 'wrap'}}>
        {products.map((item, index) => (
            <Card className={classes.root} key={index}>
            <CardActionArea>
                <CardMedia
                    component="img"
                    alt={item.name}
                    height="140"
                    // image="/static/images/cards/contemplative-reptile.jpg"
                    image={`/product/file/${item.file}`}
                    title={item.name}
                />
                <CardContent>
                <Typography gutterBottom variant="h5" component="h5">
                    name:{item.name}
                </Typography>
                <Typography variant="h6" component="h6">
                    Category:{category.find(ele => ele['_id'] === item.category) && category.find(ele => ele['_id'] === item.category).name}
                </Typography>
                <Typography variant="h6" component="h6">
                    Price:{item.price}
                </Typography>
                <Typography variant="h6" component="h6">
                    Vendor:{item.vendor}
                </Typography>
                <Typography variant="h6" component="h6">
                    Store:{item.store}
                </Typography>
                </CardContent>
            </CardActionArea>
            <CardActions>
                <Button size="small" color="primary" onClick={() => {setOpen(index + 1); setProduct(item)}}>
                    Edit
                </Button>
                <Button size="small" color="secondary" onClick={() => {setConfirm([item._id, true])}}>
                    Delete
                </Button>
            </CardActions>
            </Card>
        ))}
        </div>
        <Modal
            className={classes.modal}
            open={open !== 0}
            onClose={() => {setOpen(0)}}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
            }}
        >
                <Fade in={open !== 0}>
                    <div className={classes.paper}>
                        <Typography gutterBottom variant="h4" component="h4">
                            Edit Existing Product
                        </Typography>
                        <TextField id="name" label="name" value={product.name} onChange={(e) => setProduct({...product, name: e.target.value})}/>
                        <FormControl>
                        <InputLabel>Category</InputLabel>
                        <Select value={product.category} onChange={(e) => setProduct({...product, category: e.target.value})}>
                            {category.map((item, index) => (
                                <MenuItem value={item["_id"]} key={index}>{item.name}</MenuItem>
                            ))}
                        </Select>
                        </FormControl>
                        <TextField id="price" label="price" value={product.price} onChange={(e) => setProduct({...product, price: e.target.value})}/>
                        <TextField id="vendor" label="vendor" value={product.vendor} onChange={(e) => setProduct({...product, vendor: e.target.value})}/>
                        <TextField id="store" label="store" value={product.store} onChange={(e) => setProduct({...product, store: e.target.value})}/>
                        <input type="file"
                            color="primary"
                            ref={editRef}
                            onChange={(e) => setEditFile(e.target.files[0])}
                        />
                        <div style={{marginTop: '20px'}}>
                            <Button size="large" color="primary" onClick={() => {handleSubmit(); setOpen(0)}}>
                                Submit
                            </Button>
                            <Button size="large" color="secondary" onClick={() => setOpen(0)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Fade>
        </Modal>
        <Modal
            className={classes.modal}
            open={confirm[1]}
            onClose={() => {setConfirm([0, false])}}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
            }}
        >
            <Fade in={confirm[1]}>
                <div className={classes.paper}>
                    <Typography gutterBottom variant="h4" component="h4">
                        Are you sure to delete this entry?
                    </Typography>
                    <Button variant="outlined" color="secondary" style={{marginRight: '10px'}} onClick={() => {handleDelete(confirm[0]); setConfirm([0, false])}}>
                        Yes
                    </Button>
                    <Button variant="outlined" color="primary" onClick={() => {setConfirm([0, false])}}>
                        Cancel
                    </Button>
                </div>
            </Fade>
        </Modal>
        <Modal
            className={classes.modal}
            open={add}
            onClose={() => {setAdd(false)}}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
            }}
        >
                <Fade in={add}>
                    <div className={classes.paper}>
                        <Typography gutterBottom variant="h4" component="h4">
                            Add New Product
                        </Typography>
                        <TextField required id="name" label="name" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}/>
                        <TextField required id="price" label="price" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}/>
                        <TextField required id="vendor" label="vendor" value={newProduct.vendor} onChange={(e) => setNewProduct({...newProduct, vendor: e.target.value})}/>
                        <TextField required id="store" label="store" value={newProduct.store} onChange={(e) => setNewProduct({...newProduct, store: e.target.value})}/>
                        <FormControl>
                        <InputLabel>Category</InputLabel>
                        <Select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}>
                            {category.map((item, index) => (
                                <MenuItem value={item["_id"]} key={index}>{item.name}</MenuItem>
                            ))}
                        </Select>
                        <input type="file"
                            color="primary"
                            ref={fileRef}
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                        </FormControl>                        
                        <div style={{marginTop: '20px'}}>
                            <Button 
                                disabled={!!!(newProduct.name &&
                                    newProduct.category &&
                                    newProduct.price &&
                                    newProduct.vendor &&
                                    newProduct.store &&
                                    !!fileRef.current &&
                                    !!fileRef.current.files[0])} 
                                size="large" 
                                color="primary" 
                                onClick={() => {handleCreate(); setAdd(false)}}
                            >
                                Submit
                            </Button>
                            <Button size="large" color="secondary" onClick={() => setAdd(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Fade>
        </Modal>
        <Modal
            className={classes.modal}
            open={manageCategory}
            onClose={() => {setManageCategory(false)}}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
            }}
        >
            <Fade in={manageCategory}>
                <div className={classes.paper}>
                    <Typography gutterBottom variant="h3" component="h3">
                        Mange Category
                    </Typography>
                    <Button size="small" color="primary" variant="outlined" onClick={() => {setAddCategory([{}, true])}}>Add new category</Button>
                    {
                        category.map((item, index) => (
                            <Typography key={index} variant="h5">{item.name} 
                                <Button size="small" color="primary" onClick={() => {setEditCategory(index + 1); setChangedCategory({name: item.name})}}>Edit</Button>
                                <Button size="small" color="secondary" onClick={() => {setCategoryConfirm([item._id, true])}}>Delete</Button>
                            </Typography>
                        ))
                    }
                    <Button variant="outlined" color="primary" onClick={() => {setManageCategory(false)}}>
                        Cancel
                    </Button>
                </div>
            </Fade>
        </Modal>
        <Modal
            className={classes.modal}
            open={editCategory !== 0}
            onClose={() => {setEditCategory(0)}}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
            }}
        >
            <Fade in={editCategory !== 0}>
                <div className={classes.paper}>
                    <Typography gutterBottom variant="h4" component="h4">
                        Edit Category
                    </Typography>
                    <TextField required label="category" value={changedCategory.name} onChange={(e) => setChangedCategory({name: e.target.value})}/>
                    <Button size="small" color="primary" variant="outlined" onClick={() => {handleCategoryEdit(); setEditCategory(0)}}>
                        Submit
                    </Button>
                    <Button size="small" variant="outlined" color="primary" onClick={() => {setEditCategory(0)}}>
                        Cancel
                    </Button>
                </div>
            </Fade>
        </Modal>
        <Modal
            className={classes.modal}
            open={categoryConfirm[1]}
            onClose={() => {setCategoryConfirm([0, false])}}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
            }}
        >
            <Fade in={categoryConfirm[1]}>
                <div className={classes.paper}>
                    <Typography gutterBottom variant="h4" component="h4">
                        Are you sure to delete this entry?
                    </Typography>
                    <Button variant="outlined" color="secondary" style={{marginRight: '10px'}} onClick={() => {handleCategoryDelete(categoryConfirm[0]); setCategoryConfirm([0, false])}}>
                        Yes
                    </Button>
                    <Button variant="outlined" color="primary" onClick={() => {setCategoryConfirm([0, false])}}>
                        Cancel
                    </Button>
                </div>
            </Fade>
        </Modal>
        <Modal
            className={classes.modal}
            open={addCategory[1]}
            onClose={() => {setAddCategory([{}, false])}}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
            }}
        >
            <Fade in={addCategory[1]}>
                <div className={classes.paper}>
                    <Typography gutterBottom variant="h4" component="h4">
                        Add New Category
                    </Typography>
                    <TextField required label="category" value={addCategory[0].name && addCategory[0].name} onChange={(e) => setAddCategory([{name: e.target.value}, true])}/>
                    <Button variant="outlined" color="secondary" style={{marginRight: '10px'}} onClick={() => {handleAddCategory(addCategory[0]); setAddCategory([{}, false])}}>
                        Yes
                    </Button>
                    <Button variant="outlined" color="primary" onClick={() => {setAddCategory([{}, false])}}>
                        Cancel
                    </Button>
                </div>
            </Fade>
        </Modal>
    </div>
  );
}
